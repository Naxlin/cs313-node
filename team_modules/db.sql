-- The database structure:
CREATE TABLE person (
	personId SERIAL PRIMARY KEY,
	personFirstName varchar NOT NULL,
	personLastName varchar,
	dob varchar
);

CREATE TABLE parents (
	child int NOT NULL references person(personId) UNIQUE,
	father int references person(personId),
	mother int references person(personId)
);

ALTER TABLE parents ALTER COLUMN father DROP NOT NULL;
ALTER TABLE parents ALTER COLUMN mother DROP NOT NULL;

-- The database insertions:
INSERT INTO person (personFirstName, personLastName, dob) VALUES
('Jonathan', 'Smith', '03-02-1990'),
('Cole', 'Shirley', '06-11-1997');

INSERT INTO person (personFirstName, personLastName) VALUES
('Mark', 'Smith'),
('Brenda', 'Smith'),
('Thomas', 'Shirley'),
('Cheryl', 'Shirley');

INSERT INTO parents (child, father, mother) VALUES
(1, 3, 4),
(2, 5, 6);
