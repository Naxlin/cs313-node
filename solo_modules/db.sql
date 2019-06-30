-- The database structure:
CREATE TABLE shows (
	showID SERIAL PRIMARY KEY,
	showName varchar NOT NULL,
	showDesc varchar NOT NULL,
	episodes int NOT NULL DEFAULT 0,
	showImg varchar NOT NULL DEFAULT 'noshow.png',
	episodeLength int NOT NULL DEFAULT 20,
	ongoing BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE genres (
	genreID SERIAL PRIMARY KEY,
	genreName varchar NOT NULL
);

CREATE TABLE showgenres (
	showID int NOT NULL references shows(showID),
	genreID int NOT NULL references genres(genreID)
);

CREATE TABLE users (
	userID SERIAL PRIMARY KEY,
	username varchar NOT NULL,
	password varchar NOT NULL,
	salt varchar NOT NULL,
	sessionID varchar
);

CREATE TABLE ratings (
	userID int NOT NULL references users(userID),
	showID int NOT NULL references shows(showID),
	rating int NOT NULL DEFAULT 0
);

CREATE TABLE watched (
	userID int NOT NULL references users(userID),
	showID int NOT NULL references shows(showID),
	watched int NOT NULL DEFAULT 0,
	repeated int
);

-- The database insertions:
INSERT INTO singularity_parents (singularity, parent1, parent2, parent3, parent4, parent5, parent6, parent7, parent8, parent9) VALUES
(80, 1, 2, 13, 3, 4, 14, 5, 12, 15),
(81, 16, 17, 22, 18, 19, 23, 20, 21, 24),
(82, 25, 26, 31, 27, 28, 32, 29, 30, 33),