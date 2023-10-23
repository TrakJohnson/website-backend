var Book = class Book {
    constructor(data) {
        /* Les données de data proviennent directement de la requête SQL */
        this.book_id = data.book_id;
        this.title = data.title;
        this.isbn = data.isbn;
        this.author = data.author;
        this.publication_date = data.publication_date;
        this.publisher = data.publisher;
        this.description = data.description;
        this.borrowed = data.borrowed;
        this.date_borrowed = data.date_borrowed;
        this.thumbnail = data.thumbnail;
    }  

    static updateBookData(newInfos) {
        this.book_id = newInfos.book_id !== undefined ? newInfos.book_id : this.book_id;
        this.title = newInfos.title !== undefined ? newInfos.title : this.title;
        this.isbn = newInfos.isbn !== undefined ? newInfos.isbn : this.isbn;
        this.email = newInfos.email !== undefined ? newInfos.email : this.email;
        this.email_verified = newInfos.email_verified !== undefined ? newInfos.email_verified : this.email_verified;
        this.author = newInfos.author !== undefined ? newInfos.author : this.author;
        this.publication_date = newInfos.publication_date !== undefined ? newInfos.publication_date : this.publication_date;
        this.publisher = newInfos.publisher !== undefined ? newInfos.publisher : this.publisher;
        this.description = newInfos.description !== undefined ? newInfos.description : this.description;
        this.borrowed = newInfos.borrowed !== undefined ? newInfos.borrowed : this.borrowed;
        this.date_borrowed = newInfos.date_borrowed !== undefined ? newInfos.date_borrowed : this.date_borrowed;
        this.thumbnail = newInfos.thumbnail !== undefined ? newInfos.thumbnail : this.thumbnail;
    }
}

module.exports = Book;