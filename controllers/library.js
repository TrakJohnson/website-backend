const funcs = require('../functions/functions');
const Book = require('../models/book')

exports.getBooks = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM Books LIMIT 50", [])
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var booksToSendToFront = [];
            const getData = async () => {
                for (var index = 0; index < data.length; index++) {

                }
            }
        }
    })
}

exports.addBookMinimal = (req, res, next, isbn, location) => {
    var sqlReq = `INSERT INTO books (isbn, location) (${isbn}, ${location})`
    funcs.bddQuery(req.conBDA, sqlReq, [])
    .then(() => {
        funcs.sendSuccess(res, new Book({isbn: isbn, location: location}));
    })
    .catch((error) => {
        funcs.sendError(res, "Erreur, merci de contacter un administrateur", error)
    })
}