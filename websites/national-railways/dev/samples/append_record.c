/* append_record.c - journal a record and commit it inside the gate deadline.
 *
 * Dubrazec standard revision 3. Public domain under Article 10.
 *
 * The gate task holds a 300 ms deadline (CARDROM_DEADLINE_MS). The door task
 * will not open on a transaction that missed it, so everything here is
 * measured against the clock the caller passes in.
 */

#include "cardrom.h"
#include "clock.h"

int gate_append(cardrom_dev_t *dev, const cardrom_id_t *id,
                uint64_t station, uint64_t section, uint8_t count,
                uint16_t operator_id, tick_t started)
{
    cardrom_record_t rec;
    int rc;

    rec.stamp    = clock_minutes_since_2000();
    rec.station  = station;
    rec.section  = section;               /* zero when no section was chosen */
    rec.count    = count;                 /* 1..CARDROM_MAX_COUNT */
    rec.kind     = CARDROM_KIND_GATE;
    rec.operator = operator_id;

    /* Seal under the network key, over bytes 0..23 and the card UUID. */
    rc = cardrom_record_seal(&rec, id);
    if (rc != CARDROM_OK)
        return rc;

    /* EXPIRE first if ninety days have rolled since the last presentation.
     * It costs up to 38 ms, so it is skipped when the deadline is close. */
    if (cardrom_expire_due(dev) &&
        clock_elapsed_ms(started) + 38 + 104 < CARDROM_DEADLINE_MS)
        (void) cardrom_expire(dev, rec.stamp - CARDROM_RECORD_DAYS * 1440);

    /* The card journals to EEPROM, then commits to NAND. A card pulled out of
     * the field between the two loses nothing: the journal replays on the next
     * presentation. */
    rc = cardrom_append_record(dev, &rec);

    if (rc == CARDROM_SW_NO_SPACE) {        /* 0x6A84, every block worn */
        gate_panel_take_a_new_card();
        return CARDROM_OK;                  /* the door still opens */
    }
    if (rc == CARDROM_SW_WRITE_FAILED) {    /* 0x6581 */
        gate_log_unwritable(id);
        return CARDROM_OK;                  /* the door still opens */
    }
    if (rc != CARDROM_OK)
        return rc;

    return clock_elapsed_ms(started) <= CARDROM_DEADLINE_MS
         ? CARDROM_OK : CARDROM_E_DEADLINE;
}
