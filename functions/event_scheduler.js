const schedule = require("node-schedule");
const DateTime =  require("luxon").DateTime;  // For TZ handling
const funcs = require("./functions")


/**
 * EventScheduler()
 * Schedule event billeterie opening using node-schedule
 * Does all the SQL work
 */
class EventScheduler {
    constructor(con) {
        this.con = con
        this.events = {}
    }

    addEventSchedule(eventId) {
        let query =
            "SELECT event_id, title, date_open, email FROM newEvents " +
            "JOIN newUsers ON newEvents.login_creator=newUsers.login AND event_id=?"

        funcs
            .bddQuery(this.con, query, [eventId])
            .then((eventData) => {
                // TODO: need to make a function so that this works all the time
                // TODO: why this weird convoluted method (stringify etc)
                let s = JSON.parse(JSON.stringify(eventData[0]))
                // Thanks to the dateStrings arguments in the MySQL connection, it doesn't give a date object
                // which would be interpreted in the local TZ. All the datetime handled is Europe/Paris TZ
                let dateTimeObj = DateTime.fromISO(s.date_open.replace(' ', 'T'), {zone: "Europe/Paris"})
                let email = s.email
                let title = s.title
                if (dateTimeObj) {
                    console.log(`[scheduler] Adding event ${eventId} at date ${dateTimeObj.toString()}`)
                    this.events[eventId] = new schedule.Job(
                        eventId.toString(),
                        EventScheduler.onEventSchedule.bind(null, this.con, eventId, email, title)
                    )
                    this.events[eventId].schedule(dateTimeObj)
                }
            })
    }

    // open billetterie and send confirmation email to creator
    static onEventSchedule(con, eventId, email, title) {
        console.log(`Event schedule called on eventId ${eventId}`)
        funcs.bddQuery(con, "UPDATE newEvents SET on_sale=1 WHERE event_id=?", [eventId])

        let emailOptions = {
            from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>',
            to: email,
            bcc: 'bda.rsi.minesparis@gmail.com',
            subject: `[BDA] Ouverture de la billetterie "${title}"`,
            html: `<p>Bonjour,</p>
            <p>Ceci est un mail automatique pour annoncer l'ouverture automatique de la billetterie suivante:
            <br><b>${title}</b> 
            <br>https://bda-minesparis.fr/events/display/${eventId}</p>
            <p><i>Si c'est une erreur, n'hésitez pas à contacter les respos RSI</i></p>`
        }
        funcs.sendMail(emailOptions)

        console.log(`[scheduler][event] opened event, ID ${eventId}, email ${email}`)
    }

    removeEventSchedule(eventId) {
        if (eventId in this.events) {
            console.log(`[scheduler] Event ${eventId} removed`)
            console.log(schedule.scheduledJobs[eventId.toString()])  // this should be the same
            this.events[eventId].cancel()
            delete this.events[eventId]
        } else {
            console.log(`[scheduler] Cannot remove event ${eventId} because it isn't scheduled`)
        }
    }

    /**
     * Remove all scheduled tasks and add all upcoming billetteries
     */
    resetSchedule() {
        console.log("[scheduler] Removed all scheduled events")
        this.events = {}
        funcs
            .bddQuery(this.con, "SELECT event_id, date_open FROM newEvents")
            .then((data) => {
                for (let event of data) {
                    let eventDate = new Date(event.date_open);
                    if (eventDate !== undefined) {
                        let now = Date.now();
                        if (now < eventDate) {
                            this.addEventSchedule(event.event_id)
                        }
                    }
                }
            })
    }
}

module.exports = {EventScheduler}
