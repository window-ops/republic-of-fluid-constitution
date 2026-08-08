/* cardrom_read.c - select a CARD-ROM, authenticate, read the newest records.
 *
 * Dubrazec standard revision 3. Public domain under Article 10 of the
 * Constitution of the Republic of Fluid.
 *
 * Builds against the reference driver (cardrom-driver) and FreeRTOS. The
 * driver allocates nothing after start, so every buffer here is the caller's.
 */

#include <string.h>
#include "cardrom.h"

#define REC_LEN 32

/* Kmaster lives in the secure element; the driver asks the element to
 * diversify and never sees the key itself. */

int cardrom_read_recent(cardrom_dev_t *dev, cardrom_record_t *out, size_t max,
                        size_t *got)
{
    cardrom_select_t sel;
    cardrom_id_t id;
    int rc;

    rc = cardrom_select(dev, &sel);
    if (rc != CARDROM_OK)
        return rc;
    if (sel.revision < 3)
        return CARDROM_E_REVISION;          /* older card: count without a section */

    rc = cardrom_read_id(dev, &id);
    if (rc != CARDROM_OK)
        return rc;

    /* Ed25519 over the ROM block. A card that fails this is not refused
     * passage; the gate says what it is and takes no record. */
    if (!cardrom_id_signature_ok(&id))
        return CARDROM_E_SIGNATURE;

    rc = cardrom_auth(dev, CARDROM_KEYREF_NETWORK, &id);
    if (rc != CARDROM_OK)
        return rc;                          /* 0x6300 arrives here */

    /* READ_REC returns newest first, at most 64 to a frame. */
    size_t want = max > 64 ? 64 : max;
    rc = cardrom_read_records(dev, 0, want, out, got);
    if (rc != CARDROM_OK)
        return rc;

    for (size_t i = 0; i < *got; i++) {
        if (!cardrom_record_seal_ok(&out[i], &id)) {
            /* Written by a network whose key this gate does not hold. It is
             * counted and marked, never rejected. See CARDROM_UNVERIFIED_COUNT. */
            out[i].flags |= CARDROM_REC_UNVERIFIED;
        }
    }

    cardrom_close(dev);                     /* drops the session key */
    return CARDROM_OK;
}
