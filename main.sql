drop database grant_test;
create database grant_test;
use grant_test;

SET foreign_key_checks = 0;

CREATE TABLE ApplicantOrganisation (
    organisation_id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_name VARCHAR(255) NOT NULL,
    organisation_mail VARCHAR(100),
    team_lead_fname VARCHAR(50),
    team_lead_lname VARCHAR(50),
    Abstract TEXT,

    proposal_id INT,
    program_id INT,

    FOREIGN KEY (proposal_id) REFERENCES GrantProposal(proposal_id),
    FOREIGN KEY (program_id) REFERENCES GrantProgram(program_id)
);

CREATE TABLE GrantProposal (
    proposal_id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_title VARCHAR(255),
    required_budget DECIMAL(10, 2),
    project_description TEXT,
 
    program_id INT,
    FOREIGN KEY (program_id) REFERENCES GrantProgram(program_id)
);

CREATE TABLE GrantProgram (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(255),
    approval_date DATE,
    deadline DATE,
    progress ENUM('Pending', 'Approved', 'Completed', 'Canceled'),
    funded_status ENUM('funded', 'not_funded'),

    organisation_id INT,
    review_id INT,
    funded_project_id INT,

    FOREIGN KEY (organisation_id) REFERENCES ApplicantOrganisation(organisation_id),
    FOREIGN KEY (review_id) REFERENCES Review(review_id),
    FOREIGN KEY (funded_project_id) REFERENCES FundedProject(funded_project_id)
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    review_score DECIMAL(5, 2),
    review_whom VARCHAR(100),
    review_date DATE,
    feedback TEXT
);

CREATE TABLE FundedProject (
    funded_project_id INT AUTO_INCREMENT PRIMARY KEY,
    grant_amount DECIMAL(10, 2),
    funded_by_whom VARCHAR(100),
    fund_duration INT
);

CREATE TABLE Users(
	id varchar(511),
	username varchar(255),
    pass varchar(511),
    user_role ENUM('applicant', 'reviewer', 'funder'),
    
    role_id int
    -- add foreign key constraint
);

ALTER TABLE GrantProgram
MODIFY program_name VARCHAR(255) NOT NULL,
ADD CONSTRAINT UNIQUE_program_name UNIQUE (program_name);

ALTER TABLE FundedProject
ADD CONSTRAINT CHECK_grant_amount CHECK (grant_amount > 0);

ALTER TABLE GrantProgram
MODIFY progress ENUM('Pending', 'Approved', 'Completed', 'Canceled') DEFAULT 'Pending';

ALTER TABLE Review
ADD CONSTRAINT CHECK_review_Score CHECK (review_score >= 0 AND review_score <= 10);

-- Assuming proposal_id and program_id values exist in GrantProposal and GrantProgram tables
INSERT INTO ApplicantOrganisation (organisation_name, organisation_mail, team_lead_fname, team_lead_lname, Abstract, proposal_id, program_id)
VALUES
    ('ABC Organization', 'abc@example.com', 'John', 'Doe', 'Abstract 1', 1, 1),
    ('XYZ Foundation', 'xyz@example.com', 'Jane', 'Smith', 'Abstract 2', 2, 2);

-- Assuming program_id values exist in GrantProgram table
INSERT INTO GrantProposal (proposal_title, required_budget, project_description, program_id)
VALUES
    ('Project Proposal 1', 5000.00, 'Description 1', 1), -- program_id should exist in GrantProgram table
    ('Project Proposal 2', 8000.00, 'Description 2', 2); -- program_id should exist in GrantProgram table

-- Assuming organisation_id, review_id, and funded_project_id values exist in ApplicantOrganisation, Review, and FundedProject tables, respectively
INSERT INTO GrantProgram (program_name, approval_date, deadline, progress, funded_status, organisation_id, review_id, funded_project_id)
VALUES
    ('Program 1', '2023-01-15', '2023-03-31', 'Approved', 'not_funded', 1, 1, 1), -- organisation_id, review_id, and funded_project_id should exist in their respective tables
    ('Program 2', '2023-02-20', '2023-04-15', 'Pending', 'funded', 2, 2, 2); -- organisation_id, review_id, and funded_project_id should exist in their respective tables

-- Assuming review_id values will be generated automatically (AUTO_INCREMENT)
INSERT INTO Review (review_score, review_whom, review_date, feedback)
VALUES
    (4.5, 'Reviewer 1', '2023-01-20', 'Good proposal.'),
    (3.8, 'Reviewer 2', '2023-02-25', 'Needs more details.');

-- Assuming funded_project_id values will be generated automatically (AUTO_INCREMENT)
INSERT INTO FundedProject (grant_amount, funded_by_whom, fund_duration)
VALUES
    (6000.00, 'Funder 1', 12),
    (9500.00, 'Funder 2', 24);
    
INSERT INTO Users (id, username, pass, user_role, role_id) values 
('qoadncoqnnqencwc', 'boris', '$2a$10$rkpOftoRiobOcE6v6eXjdO/0HAXD.dDj1dDIY.sNewwFsJqfGd.l2', 'reviewer', 1),
('qoadncoqnnqencwc', 'ivan', '$2a$10$rkpOftoRiobOcE6v6eXjdO/0HAXD.dDj1dDIY.sNewwFsJqfGd.l2', 'funder', 1),
('qoadncoqnnqencwc', 'chernov', '$2a$10$rkpOftoRiobOcE6v6eXjdO/0HAXD.dDj1dDIY.sNewwFsJqfGd.l2', 'applicant', 1),
('qoadncoqnnqencwc', 'vera', '$2a$10$rkpOftoRiobOcE6v6eXjdO/0HAXD.dDj1dDIY.sNewwFsJqfGd.l2', 'applicant', 2);

SET foreign_key_checks = 1;

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'grant_test';

-- DESCRIBE ApplicantOrganisation;
