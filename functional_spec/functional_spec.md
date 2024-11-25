# CSC1049 Functional Spec

**Project:** Noted
**Authors:** Kaushal Sambhe & Ali Ahmad
**Last Updated:** 19 November 2024

# Table of Contents
- [Revision History](#revision-history)
- [1. Introduction](#1-introduction)
  - [1.1 Overview](#11-overview)
  - [1.2 Business Context](#12-business-context)
  - [1.3 Glossary](#13-glossary)
- [2. General Description](#2-general-description)
  - [2.1 Product/System Functions](#21-productsystem-functions)
    - [2.1.1 Primary Functions](#211-primary-functions)
      - [Authentication](#authentication)
      - [Note Creation and Management](#note-creation-and-management)
      - [Markdown Rendering and Preview](#markdown-rendering-and-preview)
      - [Tagging and Organisation](#tagging-and-organisation)
      - [Full-Text Search](#full-text-search)
      - [Version Control](#version-control)
      - [Asymmetric End-to-End Encryption](#asymmetric-end-to-end-encryption)
      - [Real-Time Collaboration](#real-time-collaboration)
      - [Image Integration](#image-integration)
    - [2.1.2 Secondary Functions](#212-secondary-functions)
      - [Offline Access](#offline-access)
      - [Export Notes](#export-notes)
    - [2.1.3 Stretch Functions/Goals](#213-stretch-functionsgoals)
      - [Real Time Collaboration in CLI](#real-time-collaboration-in-cli)
      - [Task Management](#task-management)
  - [2.2 User Characteristics and Objectives](#22-user-characteristics-and-objectives)
  - [2.3 Operational Scenarios](#23-operational-scenarios)
  - [2.4 Constraints](#24-constraints)
- [3. Functional Requirements](#3-functional-requirements)
  - [3.1 User Authentication](#31-user-authentication)
  - [3.2 End-to-End Encryption](#32-end-to-end-encryption)
  - [3.3 Real-Time Collaboration](#33-real-time-collaboration)
  - [3.4 Create Notes](#34-create-notes)
  - [3.5 Edit Notes](#35-edit-notes)
  - [3.6 View Notes](#36-view-notes)
  - [3.7 Push Notes](#37-push-notes)
  - [3.8 Pull Notes](#38-pull-notes)
  - [3.9 Managing Different Versions](#39-managing-different-versions)
  - [3.10 Adding a Collaborator](#310-adding-a-collaborator)
  - [3.11 Delete Notes](#311-delete-notes)
  - [3.12 Image Handling with Amazon S3](#312-image-handling-with-amazon-s3)
  - [3.13 Full-Text Search](#313-full-text-search)
  - [3.14 Tag Management](#314-tag-management)
  - [3.15 Download HTML Version of Markdown Notes](#315-download-html-version-of-markdown-notes)
- [4. System Architecture](#4-system-architecture)
  - [4.1 Feasible System Architecture](#41-feasible-system-architecture)
    - [Web Client](#web-client)
    - [Terminal Client](#terminal-client)
    - [Collaborative Editor](#collaborative-editor)
    - [API Layer](#api-layer)
    - [Web Socket](#web-socket)
    - [Database](#database)
    - [Version Control](#version-control-1)
  - [4.2 Stretch Goal System Architecture](#42-stretch-goal-system-architecture)
    - [Text Editor](#text-editor)
- [5. High Level Design](#5-high-level-design)
  - [5.1 Sequence Diagram for User Login on Web Interface](#51-sequence-diagram-for-user-login-on-web-interface)
  - [5.2 Sequence Diagram for User Login on CLI](#52-sequence-diagram-for-user-login-on-cli)
  - [5.3 Sequence Diagram for Creating a Note](#53-sequence-diagram-for-creating-a-note)
  - [5.4 Sequence Diagram for Editing a Note on Both Clients - No Real-Time Collaboration](#54-sequence-diagram-for-editing-a-note-on-both-clients---no-real-time-collaboration)
  - [5.5 Sequence Diagram for Editing a Note on Web with Real-Time Collaboration](#55-sequence-diagram-for-editing-a-note-on-web-with-real-time-collaboration)
    - [Version 1](#version-1)
    - [Version 2](#version-2)
  - [5.6 Pulling Notes on CLI](#56-pulling-notes-on-cli)
- [6. Preliminary Schedule](#6-preliminary-schedule)
- [7. Appendix](#7-appendix)

# 1. Introduction

## 1.1 Overview
The system, Noted, is a Markdown-based note-taking application built for both terminal and web users. The system allows users to create, edit and collaborate on notes through a CLI or a web interface.

The system provides functions such as a version control system that enables users to track and restore previous versions of their notes. The system also utilises end-to-end encryption to protect data both at rest and during transmission. Secure authentication is also included via Google and GitHub OAuth and JWT tokens. The system integrates with Amazon S3 which allows users to efficiently embed images within their notes.

Additionally, Noted offers real-time collaboration features, enabling users to edit notes simultaneously and securely. By allowing users to tag notes and, along with full-text search capabilities, it will facilitate easy organisation and retrieval of notes. Noted also provides Markdown previews, including live previews on the web client.

The system is designed to meet the need for a unified note-taking experience that works seamlessly across both terminal and web interfaces. Developers often prefer terminal tools for note-taking but lack the convenience of a web interface. Noted bridges this gap, offering a central place for managing notes securely and efficiently. It provides synchronisation between terminal and web clients, enabling real-time collaboration while maintaining secure, encrypted content.

## 1.2 Business Context
This system integrates seamlessly with any development environment that supports Go, which is essential for the CLI. It could be easily deployed in Dublin City University’s computer labs to support student developers who work across both terminal and web platforms.

## 1.3 Glossary
| Term                                        | Definition                                                                                                                                           |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **OAuth**                                   | A protocol for authorization that allows users to grant third-party applications access to their resources without sharing login credentials.                    |
| **End-to-End Encryption**                   | A method where data is encrypted before it leaves the sender and can only be decrypted by the recipient, keeping it secure from anyone in between. |
| **Asymmetric Encryption**                   | A method using a pair of keys: a public key for encryption and a private key for decryption. It allows secure communication without sharing private keys. |
| **Symmetric Encryption**                    | A method where the same key is used for both encryption and decryption. It is fast and efficient.|
| **Amazon S3**                               | A cloud storage service by AWS for storing and retrieving large amounts of data, often used for media like images.                                       |
| **JWT (JSON Web Token)**                    | A compact, URL-safe token used for securely transmitting information between parties, commonly used for authentication.                               |
| **CRDTs (Conflict-free Replicated Data Types)** | Data structures designed for distributed systems that allow for concurrent updates without conflicts. |
| **Markdown**                                | A lightweight markup language for formatting text. |
| **CLI**                                     | Command-line interface. |
| **WSL**                                     | Windows Subsystem for Linux. |

# 2. General Description

## 2.1 Product/System Functions
### 2.1.1 Primary Functions
#### **Authentication**
- Users can log in using Google and GitHub OAuth for secure and convenient access. Additionally, users have the option to register and log in with their email and password, with credentials securely stored in MongoDB. JWTs are implemented to maintain secure sessions across both terminal and web platforms.

#### **Note Creation and Management**
- The ability to create, edit, and delete Markdown notes through either the terminal client or the web interface. Regardless of the preferred environment, the notes will be managed seamlessly.

#### **Markdown Rendering and Preview**
- The system renders Markdown to display well-formatted notes in both terminal and web clients. The web client will display live previews, providing immediate visual feedback. For elements that cannot be rendered in the terminal, the system generates a link to view the full preview within the web client.

#### **Tagging and Organisation**
- Notes can be categorised using tags, making it easy to retrieve and organise them.

#### **Full-Text Search**
- A comprehensive search functionality allows users to locate notes based on their content, tags, or titles, ensuring quick and efficient access to relevant information.

#### **Version Control**
- The system maintains a version history for each note, enabling users to view, compare, and restore previous versions as needed. This feature ensures that users can track changes and revert to earlier states of their notes effortlessly.

#### **Asymmetric End-to-End Encryption**
- All notes are encrypted on the user’s device before being sent to the database, ensuring data security during transmission and storage. A symmetric key is implemented for real-time collaboration. This symmetric key is encrypted and decrypted using the user's public/private key pairs, providing an additional layer of security.

#### **Real-Time Collaboration**
- The system will allow for notes to be edited simultaneously in web clients. The system will manage notes using CRDTs to ensure seamless real-time synchronisation and data consistency. Additionally, encrypted symmetric keys are employed to maintain data integrity and privacy throughout the collaboration process.

#### **Image Integration**
- Users can upload and manage images through Amazon S3 cloud storage. The system generates reusable links, allowing users to embed images directly into their Markdown notes, enhancing the visual appeal and functionality of their content.

### 2.1.2 Secondary Functions
#### **Offline Access**
- The CLI will allow for offline editing of notes. As notes on the CLI are edited locally, they can be saved to the server when connectivity is restored.

#### **Export Notes**
- The system allows users to export notes in HTML.

### 2.1.3 Stretch Functions/Goals
#### **Real Time Collaboration in CLI**
- Real-time collaboration within the CLI, allowing multiple users to edit notes simultaneously.

#### **Task Management**
- Basic task management features, such as to-do lists and task assignments, are integrated within notes. This allows users to organise and track tasks directly within their note-taking environment.

## 2.2 User Characteristics and Objectives
- **Primary Users**: Developers, software engineers, and tech enthusiasts who frequently work on a CLI, Markdown, and version control systems.

- **Secondary Users**: Users who seek a simple, user-friendly interface with features like Markdown previews, real-time collaboration, and secured notes through encryption.

- **Technical Expertise**:
  - Proficient in using a CLI
  - Familiar with version control (e.g., Git) and Markdown.

- **Our Main Objectives with Noted**
    - **Ease of Use**: Users want a tool that is simple to set up and use, regardless of their technical expertise.
    - **Cross-Platform Support**: The ability to manage notes from both terminal and web interfaces is essential to cater to a diverse user base.
    - **Security**: Users expect their data to be securely stored and transmitted, with asymmetric end-to-end encryption to protect sensitive information.
    - **Collaboration**: Real-time collaboration features are crucial for users who need to work on notes with others, making teamwork seamless and efficient.

## 2.3 Operational Scenarios
Listed below are the different scenarios users might find themselves in.

++Scenario 1++: **Login to Web Interface/ Terminal Client**
The user accesses the Noted web interface via a browser/terminal.
The user is prompted to log in through either (on CLI user gets redirected to the web):
 - Google OAuth
 - GitHub OAuth
 - Email and Password

The user will then create a new account if they don't have one already.
After logging in successfully, the user is redirected to their dashboard, where they can view, create, and manage notes. If credentials are incorrect or the user doesn’t exist, the user is denied access and prompted to retry.
CLI users will be given a message to close the window and return back to the terminal.

++Scenario 2++: **View a Note**
The user selects a note from their dashboard. The system retrieves and, after decrypting the note, displays the content of it in the editor or a view mode. It shows the full Markdown content, including any embedded images from Amazon S3. The user can view the note’s version history and restore previous versions if needed. In the CLI, the user can enter a command to open a note by its title or navigate to the directory where all notes are stored.

++Scenario 3++: **Create a New Note**
The user clicks the "Create New Note" button. The user enters a title and begins writing the note in Markdown format. The system automatically saves the note with version control enabled, allowing the user to view or restore previous versions. In the CLI, the user will enter the command to create a new note; it will then open in the editor. The user can also tag the note with relevant labels for easier organisation. The system encrypts the note and sends it to the database.

++Scenario 4++: **Edit a Note**
The user selects an existing note to edit. The user makes changes to the content in the editor. The system saves changes and stores the new version in the version control system and, after encrypting the note, updates the database.

++Scenario 5++: **Delete a Note**
The user selects a note they wish to delete. The user confirms the deletion. The system removes the note from the user's account and updates the database. The user is notified if the deletion is successful. In the CLI, the user enters the command to select the note they wish to delete.

++Scenario 6++: **Upload an Image to a Note**
The user selects a note to which they want to add an image. The user uploads an image through the web interface or terminal client. The system uploads the image to Amazon S3 and generates a URL. The user can then embed the URL in the Markdown note, and the image is displayed within the note.

++Scenario 7++: **Create and Manage Tags for Notes**
The user selects a note to which they want to add tags.
The user adds or removes tags that categorise the note (e.g., “Work”, “Personal”, etc.).
The system updates the tags, and the user can filter notes by tags for better organisation.

++Scenario 8++: **View Markdown Preview**
The user creates or edits a note in Markdown format. The user can click the "Preview" button to see a live preview of how the note will look once rendered. The system displays the rendered content in real-time (on the web client). In the CLI, the user can run the command to show the rendered content in the terminal or get a link to the web client that will show elements that cannot be rendered in the terminal.

++Scenario 9++: **Create and Manage Tags for Notes**
The user selects a note to which they want to add tags. The user adds or removes tags that categorise the note (e.g., “Work”, “Personal”, etc.). The system updates the tags, and the user can filter notes by tags for better organisation.

++Scenario 10++: **Adding a Collaborator**
On the page to edit a note, the user clicks the "Add Collaborator" button and enters the email address or username of the collaborator they want to invite. The system checks the collaborator's credentials, then sends an invitation via email. The collaborator receives the invitation and accepts it.

++Scenario 11++: **Edit a Note with a Collaborator**
The user and the collaborator open the shared note simultaneously on the web interface. Each user makes changes to the note’s content in real-time. The system synchronises the changes, ensuring that all edits are reflected instantly across all active sessions. Conflict-free Replicated Data Types (CRDTs) automatically resolve any potential conflicts, maintaining a consistent view of the note for both users. The version history is updated to include the latest changes made by both collaborators.

++Scenario 12++: **Removing a Collaborator**
The user selects the shared note from their dashboard. On the web interface, the user clicks the "Manage Collaborators" button, selects the collaborator they wish to remove, and confirms the action.

## 2.4 Constraints

**Time Constraints**
The main challenge is the short timeframe available for development. A lot of features must be implemented within a short period. Getting proficient in Go and learning new tools might hinder development time.

**Design Constraints**
The design needs to be responsive to various screen sizes, to ensure consistency and a user-friendly experience across devices.

**Platform Constraints**
The CLI will only be available on Unix-based operating systems. It will not be available on Windows unless through WSL. The web interface must perform consistently across multiple browsers. Encryption needs to be implemented properly so notes can be encrypted and decrypted regardless of platform.

**Performance and Speed Requirements**
By implementing encryption and real-time collaboration, performance might be affected. We must deliver real-time updates without noticeable latency to ensure user experience stays smooth.

**Resource Constraints**
MongoDB and Amazon S3 do not provide unlimited storage for free tiers. We must observe our usage to ensure we stay within free tier limits.

# 3. Functional Requirements

## 3.1 User Authentication
- **Description**: The system should allow users to authenticate through Google OAuth, GitHub OAuth, or by creating a local account. For a local account, the user must register before logging in. For OAuth, the system stores the user information in the database during their first authentication. On subsequent logins, the system grants access without additional registration. Once authenticated, the user is granted access. For the CLI, the system will create a directory that will store all the notes that the user creates.
- **Criticality**: High – User authentication serves as the gateway to all functionality in the system.
- **Technical Issues**:
    - Securely handling OAuth integration for Google and GitHub with the backend.
    - Handling user sessions effectively for access.
    - Implementing user account management for local sign-ups, including password hashing and validation.
- **Dependencies with other requirements**:
    - Dependent on the backend setup for managing sessions and OAuth configuration.
    - Foundational for all other requirements that require user verification.

## 3.2 End-to-End Encryption
- **Description**: The system must implement asymmetric end-to-end encryption to protect the security of user notes. Using a pair of cryptographic keys (public and private), notes should be encrypted on the user's device before being stored on the server, ensuring that only the user can access the content with their private key. For collaboration, notes are encrypted using a symmetric key which is encrypted individually using the public key of each collaborator.
- **Criticality**: High – Ensures that the user's notes remain confidential and secure, addressing privacy concerns and protecting against unauthorised access.
- **Technical Issues**:
    - Generating and managing asymmetric key pairs (public and private keys) for each user effectively.
    - Implementing symmetric encryption for collaboration.
    - Handling key distribution and encryption for collaborative access using shared symmetric keys.
    - Integrating encryption properly on both web interface and CLI, so encryption and decryption are seamless across both platforms.
- **Dependencies with Other Requirements**:
    - Links with Version Control (3.10) as they store encrypted versions of the note.
    - Ties into Real-Time Collaboration (3.3) for ensuring data is secure when being sent between clients.
    - Integrates with Edit Notes (3.5), Push Notes (3.7), Pull Notes (3.8)

## 3.3 Real-Time Collaboration
- **Description**: The system must support real-time collaboration, allowing multiple users to work on the same note simultaneously. Changes made by one user should be reflected for all collaborators. Notes should be securely encrypted during collaboration.
- **Criticality**: High – Essential for teams that need to collaborate on notes.
- **Technical Issues**:
    - Implementing real-time synchronisation using Y.js to handle concurrent edits.
    - Ensuring only users that have been given access can edit it.
    - Ensuring encryption doesn't delay transmission of data between clients.
    - Making sure conflicts are resolved correctly.
- **Dependencies with Other Requirements**:
    - Relies on real-time WebSocket communication.
    - Depends on End-to-End Encryption (3.2) for encrypted collaboration.
    - Relies on Version Control (3.10) for storing versions.
    - Depends on Add a Collaborator (3.10).
    - Integrates with Edit Notes (3.5).

## 3.4 Create Notes
- **Description**: The user must be able to create new Markdown notes through the web interface and CLI. On the CLI, a Markdown file with the name of the title of the note will be created in the directory that holds all notes.
- **Criticality**: High – This is a core feature of the application. Without the ability to create notes, users wouldn't be able to utilise the other features that depend on notes.
- **Technical Issues**:
    - Creating a note on CLI with a command must properly store it in the database, ensuring its accessibility on both clients.
    - Ensuring that the directory that stores all notes has not been deleted.
- **Dependencies with other requirements**:
    - Relies on version control (3.9).

## 3.5 Edit Notes
- **Description**: Users must be able to edit existing notes. Users should be able to modify the content of their notes, with changes being encrypted and saved in the database with proper version tracking. Users on the web interface must also have the choice to see a live preview of the content rendered in Markdown. Users should be able to see the cursor of another user during collaboration and the changes that they have made. On the CLI, this will open the note in the default editor of the terminal.
- **Criticality**: High – Editing notes is essential for users. Without this feature, users would be unable to make any changes to their notes after creation.
- **Technical Issues**:
    - Ensuring the note on the CLI has not been deleted from the main directory; the system will have to grab the latest version in the database if this is the case.
    - Managing and storing edited notes with proper version control.
    - Ensuring Markdown content is rendered correctly on both platforms.
    - Ensuring content is synchronised during real-time collaboration.
    - Showing changes made by different users and indicating where they are in the editor.
- **Dependencies with other requirements**:
    - Depends on End-to-End Encryption (3.2) for encrypting content.
    - Relies on Version Control (3.9) to keep track of changes made to notes and allow for version restoration.
    - Integrates with Real-Time Collaboration (3.3) and Image Handling with Amazon S3 (3.12).
    - Relies on View Notes (3.6) to show the user a live preview.

## 3.6 View Notes
- **Description**: Users must be able to view their notes, rendered in Markdown format. Users must be able to view any note they have created, and the notes should be accessible from both the web and CLI. In the web interface, users must have the option to view notes as they write them. The system should display a preview of the notes directly in the terminal and provide a link to the web interface to show a full preview for elements that cannot be rendered in the terminal.
- **Criticality**: High – Fundamental for users to review their notes and ensure it is formatted correctly.
- **Technical Issues**:
    - Correctly rendering content on web interface and CLI.
    - Fast reading of the note file on the CLI to display links or render in the terminal.
- **Dependencies with other requirements**:
    - Ties into Edit Notes (3.5) to show users a live preview.

## 3.7 Push Notes
- **Description**: The system must allow the CLI client to push local changes to the server. This is to ensure edits made on the terminal are sent to the database so the two clients will be kept in sync. The content of the note must be encrypted before being sent to the server.
- **Criticality**: High – Essential as it is the way CLI users will send the note they have written to the server.
- **Technical Issues**:
    - Main issue is to quickly read the file content to push to the server.
- **Dependencies with other requirements**:
    - Dependent on End-to-End Encryption (3.2) for encrypting the content before being sent to the server.
    - Relies on Version Control (3.9) to keep track of changes made to notes and allow for version restoration.

## 3.8 Pull Notes
- **Description**: The system must allow the CLI client to pull the notes from the server into the directory created for notes. All notes must be decrypted as well before being stored.
- Users must be able to delete their notes. The system should confirm successful deletion and ensure all associated data are removed as well.
- **Criticality**: High – Critical for users as it ensures they have access to the most recent updates made from any client.
- Not critical to the main functionality of the system, allows users to have full control over their notes, allowing them to remove unnecessary notes.
- **Technical Issues**:
    - Decrypting each note will take time, especially if there are a lot of notes. A proper system should be developed to ensure notes that have been edited since the last pull will be retrieved from the database.
- **Dependencies with other requirements**:
    - Dependent on End-to-End Encryption (3.2) for decrypting content.
    - The backend and CLI's abilities to quickly retrieve and store files from the database.

## 3.9 Managing Different Versions
- **Description**: The system must provide a built-in versioning system for notes, enabling users to view and restore previous versions of a note. Notes are encrypted until the user wishes to view the content, at which point it is decrypted.
- **Criticality**: High – Version control is important for users who need to track changes, undo mistakes, or restore previous work.
- **Technical Issues**:
    - Main issue is to store multiple versions of notes in MongoDB efficiently, ensuring retrieval is fast and handling rollback to previous versions in a user-friendly manner.
    - Only the version the user wants to see will be decrypted, saving time as not all versions are required to be decrypted.
- **Dependencies with other requirements**:
    - Used in Edit Notes (3.5) and Push Notes (3.7).
    - The backend’s ability to manage and store data.

## 3.10 Adding a Collaborator
- **Description**: Users must be able to add collaborators to their notes, giving them access to view and edit shared notes.
- **Criticality**: High – Essential feature for collaboration.
- **Technical Issues**:
    - Must ensure the symmetric key for collaboration is encrypted with the collaborator's public key.
- **Dependencies with other requirements**:
    - Ties into Real-Time Collaboration (3.3).

## 3.11 Delete Notes
- **Description**: Users must be able to delete their notes. The system should confirm successful deletion and ensure all associated data are removed as well.
- **Criticality**: Medium – Not critical to the main functionality of the system, allows users to have full control over their notes, allowing them to remove unnecessary notes.
- **Technical Issues**:
    - Ensure everything associated with the note is deleted.
- **Dependencies with other requirements**:
    - N/A

## 3.12 Image Handling with Amazon S3
- **Description**: The system must allow users to upload and link images from Amazon S3 to their notes. This reduces storage requirements and improves performance. Users on the web interface do not have to add the link of the image themselves; this will be handled by the system.
- **Criticality**: Medium – This feature improves the user experience by allowing image embedding but is not essential to the core functionality of note creation.
- **Technical Issues**:
    - Integration of Amazon S3 with backend.
    - Reading images on the CLI and web interface so they have the correct format that is required to upload them to S3.
    - Limitations on file sizes.
- **Dependencies with other requirements**:
    - Integrates with Edit Notes (3.5) for embedding images within notes.

## 3.13 Full-Text Search
- **Description**: Users must be able to search for notes by title, content, or tags. The search feature should quickly return relevant results to facilitate easy navigation through large sets of notes.
- **Criticality**: Medium/ Low – A feature for usability, but the system can function without it.
- **Technical Issues**:
    - As notes are encrypted, searching must be done on the client. An efficient search indexing system must be implemented to quickly search the files.
- **Dependencies with other requirements**:
    - Integrates with Tag Management (3.14).

## 3.14 Tag Management
- **Description**: Users must be able to tag their notes with labels for categorisation and easy searching. They must also be able to remove any tags as well.
- **Criticality**: Medium – Helps in organising notes but is not critical for basic functionality.
- **Technical Issues**: N/A
- **Dependencies with other requirements**:
    - Utilises Tag Data from Tag Management (3.14)

## 3.15 Download HTML Version of Markdown Notes
- **Description**: Users must be able to download their Markdown notes as HTML files.
- **Criticality**: Low – Adds convenience for users, not essential at all.
- **Technical Issues**:
    - Must ensure the note is saved correctly in the CLI - to the current directory or a specified one if provided.
- **Dependencies with other requirements**: N/A

# 4. System Architecture

## 4.1 Feasible System Architecture

![](https://i.imgur.com/YBSu3Yo.png)

### 4.1.1 Web Client
This is the React-based interface where users can create, edit, and manage their Markdown notes. Redux.js will be used for managing state.

### 4.1.2 Terminal Client
This is the Go-based CLI interface where users can create, edit, and manage their Markdown notes.

### 4.1.3 Collaborative Editor
Handles the core functionality of real-time collaboration. Uses Y.js and CRDT to handle conflicts during collaboration. Communicates with the WebSocket and ensures changes are synchronised across different clients.

### 4.1.4 API Layer
The API layer provides the interface for all communication between the Frontend and the Backend.

### 4.1.5 WebSocket
Connections are made to maintain real-time synchronisation across web clients.

### 4.1.6 Database
The Database stores user notes and their versions.

### 4.1.7 Version Control
The Version Control system allows users to see a history of changes made to their notes.

## 4.2 Stretch Goal System Architecture

![](https://i.imgur.com/59f6p4Z.png)

### 4.2.1 Text Editor
Handles real-time collaboration. Communicates with the WebSocket and ensures changes are synchronised across different clients (web and CLI).

# 5. High Level Design

## 5.1 Sequence Diagram for User Login on Web Interface
![](https://i.imgur.com/JRp6TTO.png)

## 5.2 Sequence Diagram for User Login on CLI
![](https://i.imgur.com/i3WcyWj.png)

## 5.3 Sequence Diagram for Creating a Note
![](https://i.imgur.com/g2Gem02.png)

## 5.4 Sequence Diagram for Editing a Note on Both Clients - No Real-Time Collaboration
![](https://i.imgur.com/vpK9Nr7.png)

## 5.5 Sequence Diagram for Editing a Note on Web with Real-Time Collaboration
### Version 1
![](https://i.imgur.com/UCK1NC3.png)

### Version 2
![](https://i.imgur.com/7BaKhZY.png)

## 5.6 Pulling Notes on CLI
![](https://i.imgur.com/JEQbGQK.png)

<!-- ## 5.1 Web application overview

## 5.2 CLI overview
 -->

# 6. Preliminary Schedule

We have outlined an initial schedule below, which serves as a roadmap for our project's development. Please note that this schedule is provisional and may be adjusted as the project progresses and as we refine our understanding of the work completed and the work remaining. We are committed to maintaining flexibility in our planning to accommodate any changes that may arise during the course of the project.

![](https://i.imgur.com/eQct5Gp.png)


# 7. Appendix

