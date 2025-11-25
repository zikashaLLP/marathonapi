-- Marathon Registration Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS marathon_db;

USE marathon_db;

-- ------------------------------------------------------
-- USER TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Mobile_Number VARCHAR(15) NOT NULL UNIQUE,
    OTP VARCHAR(10) NULL,
    OTP_Timestamp DATETIME NULL,
    Is_Verified BOOLEAN DEFAULT FALSE,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- MARATHON TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS Marathon (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Track_Length VARCHAR(50),
    Date DATE,
    Reporting_Time TIME,
    Run_Start_Time TIME,
    Location VARCHAR(255),
    Terms_Conditions TEXT,
    How_To_Apply TEXT,
    Eligibility_Criteria TEXT,
    Rules_Regulations TEXT,
    Runner_Amenities TEXT,
    Route_Map VARCHAR(255),
    Price_List TEXT,
    Fees_Amount DECIMAL(10,2),
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- PARTICIPANT DETAILS TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS ParticipantDetails (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Full_Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Contact_Number VARCHAR(15) NOT NULL,
    Gender ENUM('Male','Female','Other') NOT NULL,
    Age INT NOT NULL,
    Address TEXT NOT NULL,
    City VARCHAR(100) NOT NULL,
    Pincode VARCHAR(10) NOT NULL,
    State VARCHAR(100) NOT NULL,
    Tshirt_Size ENUM('XXS-34','XS-36','S-38','M-40','L-42','XL-44','XXL-46','Child Size 10 to 12 Years - 32') NOT NULL,
    Date_of_Birth DATE NOT NULL,
    Blood_Group VARCHAR(10) NOT NULL,
    Running_Group VARCHAR(255),
    Is_Terms_Condition_Accepted BOOLEAN DEFAULT FALSE,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- PARTICIPANT TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS Participant (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BIB_Number VARCHAR(50) UNIQUE,
    User_Id INT,
    ParticipantDetails_Id INT,
    Marathon_Id INT,
    Marathon_Type ENUM('Open','Defence'),
    Is_Payment_Completed BOOLEAN DEFAULT FALSE,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (User_Id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ParticipantDetails_Id) REFERENCES ParticipantDetails(Id) ON DELETE CASCADE,
    FOREIGN KEY (Marathon_Id) REFERENCES Marathon(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------
-- PAYMENT TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS Payment (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Transaction_Id VARCHAR(255),
    Order_Id VARCHAR(255),
    Participant_Id INT,
    User_Id INT,
    Amount DECIMAL(10,2),
    Payment_Status ENUM('Pending','Success','Failed') DEFAULT 'Pending',
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (Participant_Id) REFERENCES Participant(Id) ON DELETE CASCADE,
    FOREIGN KEY (User_Id) REFERENCES Users(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------
-- RESULT TABLE
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS Result (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Marathon_Id INT,
    BIB_Number VARCHAR(50),
    Name VARCHAR(255),
    Gender ENUM('Male','Female'),
    Race_Time VARCHAR(50),
    Category ENUM('Open','Defence'),
    Position ENUM('First','Second','Third'),
    Image VARCHAR(255),
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (Marathon_Id) REFERENCES Marathon(Id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_mobile ON Users(Mobile_Number);
CREATE INDEX idx_participant_user ON Participant(User_Id);
CREATE INDEX idx_participant_marathon ON Participant(Marathon_Id);
CREATE INDEX idx_payment_order ON Payment(Order_Id);
CREATE INDEX idx_result_marathon ON Result(Marathon_Id);
CREATE INDEX idx_result_bib ON Result(BIB_Number);

