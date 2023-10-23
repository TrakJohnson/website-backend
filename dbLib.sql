CREATE TABLE `books` (
    `book_id` INT AUTO_INCREMENT,
    `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `isbn` int UNSIGNED DEFAULT NULL,
    `author` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `publication_date` datetime DEFAULT NULL,
    `publisher` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `borrowed` tinyint NOT NULL DEFAULT 0,
    `date_borrowed` datetime DEFAULT NULL,
    `thumbnail` mediumtext CHARACTER SET uft8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `location` int UNSIGNED DEFAULT NULL
    PRIMARY KEY (book_id)
)