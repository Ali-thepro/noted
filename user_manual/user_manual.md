# Noted User Manual

Student 1: **Ali Ahmad** - 22312403
Student 2: **Kaushal Sambhe** - 22388443

Supervisor: **Dr. Stephen Blott**


# Table of Contents
- [1. Installation](#1-installation)
  - [1.1 Prerequisites](#11-prerequisites)
  - [1.2 Backend Installation](#12-backend-installation)
  - [1.3 Frontend Installation](#13-frontend-installation)
  - [1.4 CLI Installation](#14-cli-installation)
- [2. User Guide](#2-user-guide)
  - [2.1 Web Application](#21-web-application)
    - [2.1.1 Login/Signup](#211-login-signup)
    - [2.1.2 Creating a Note](#212-creating-a-note)
    - [2.1.3 Editing a Note](#213-editing-a-note)
      - [2.1.3.1 Uploading an Image](#2131-uploading-an-image)
    - [2.1.4 Managing Notes](#214-managing-notes)
      - [2.1.4.1 Editing and Deleting Notes](#2141-editing-and-deleting-notes)
      - [2.1.4.2 Searching and Filtering Notes](#2142-searching-and-filtering-notes)
    - [2.1.5 Managing Versions](#215-managing-versions)
    - [2.1.6 Changing the Theme](#216-changing-the-theme)
    - [2.1.7 Logging out/Forgetting your password](#217-logging-out-forgetting-your-password)
  - [2.2 CLI](#22-cli)



# 1. Installation

## 1.1 Prerequisites

Make sure to have the following installed on your machine:
- `Node.js` (v22.13.0)
- `npm` (v11.1.0)
- `Go` (v1.23.1)

After having the prerequisites installed, you can install the project source code from GitLab.
We will begin by cloning our Git repository.

```bash
git clone https://gitlab.computing.dcu.ie/ahmada5/2025-csc1049-ahmada5-noted.git
```

## 1.2 Backend Installation

1. Navigate to the backend directory.

```bash
cd 2025-csc1049-ahmada5-noted/code/backend
```

2. Install the required packages and dependencies for the Express server.

```bash
npm install
```

3. In addition to the dependencies, there are a few environment variables that need to be set in order for Noted to function. Create a `.env` file in the backend directory and add the following variables:

```bash
PORT=3000
MONGODB_URI=your_mongodb_uri
TEST_MONGODB_URI=your_test_mongodb_uri
SERVER_URI=http://localhost:3000
UI_URI=http://localhost:5173
ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
AWS_BUCKET_NAME=your_aws_bucket_name
AWS_BUCKET_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_KEY=your_aws_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

4. Once everything is configured, start the backend server.

```bash
npm start
```

## 1.3 Frontend Installation

1. Navigate to the frontend directory.

```bash
cd 2025-csc1049-ahmada5-noted/code/frontend
```

2. Install the required packages and dependencies for React

```bash
npm install
```

3. Once everything is configured, start the frontend server.

```bash
npm run dev
```


## 1.4 CLI Installation

1. Navigate to the CLI directory.

```bash
cd 2025-csc1049-ahmada5-noted/code/client
```

2. Install the required packages and dependencies for the CLI.

```bash
go mod download
```

3. Once everything is configured, start the CLI.

```bash
make install
```

4. Once the CLI is installed, copy this line and paste it in your `~/.zshrc` or `~/.bashrc` file.

```bash
source ~/.noted/wrapper.sh
```

5. Once the wrapper is installed, restart your terminal.

```bash
source ~/.zshrc
```
or

```bash
source ~/.bashrc
```

6. Now you can use the CLI by typing `noted` in your terminal.

```bash
noted
```

# 2. User Guide

## 2.1 Web Application

### 2.1.1 Login/Signup


Once you first visit the web page, you will be redirected to the login page if you are not already logged in. You can either sign in to an existing account or create a new one. You have three options for signing in: You can either use your email address and password, or sign in via Google or GitHub.

![Login Page](https://i.postimg.cc/CdyBd9q7/image.png)

If you are a new user, you can create an account by clicking on the "Sign up" link. If you already have an account, enter your login credentials. Once you have created your account, you will be prompted to create your master password. This is used to encrypt the contents of your notes and ensure that only you can access them. Noted operates with zero-knowledge encryption. This means that Noted has zero knowledge of a way to retrieve or reset your master password. You are in charge of remembering your master password.

![Master Password](https://i.postimg.cc/VkZSCSn5/image.png)

Once you have created your master password, you will be redirected to the home page.

If you already have an account, and signed in, you will be redirected to the home page where you will be asked to enter your master password.

![Master Password](https://i.postimg.cc/8PjgCjpZ/image.png)

After successfully entering your master password, you will be be able to view the home page.

![Home Page](https://i.postimg.cc/66bFFtrn/image.png)

### 2.1.2 Creating a Note

To get started with creating a note, you can click on the "New Note" button in the top right corner of the screen. You will then be prompted to enter a title or tags (optional) for your note. After the note is created you will be redirected to the edit note page.

### 2.1.3 Editing a Note

![image.png](https://i.postimg.cc/WpSJvfzM/image.png)

This is where you will be able to edit your note using Markdown. If you are new to Markdown, you can visit the "about page" on the navigation bar to learn some of the basics and advanced features that Noted supports. As shown in the image above, there is a toolbar that allows you to format your text using Markdown for you. Some Markdown features that deal with formatting text such as bold and italic will wrap around any selected text. If no text is selected it will insert a sample bolded sentence at the current cursor position. Other features such as headings and lists will insert the appropriate Markdown syntax at the start of the line. As you write your Markdown note, you will be able to see a live preview of your note on the right hand side.

In the top left corner you will have the option to change the view of your note. You can choose just to choose the editor, the preview or both, which is the default option. The status bar is at the bottom of the editor. From here you can see your line and column number and have the option to change the theme, font style, and font size. You can also change the keyboard mapping. The available options are: Vim, Emacs, Sublime and the default option. Also available is the option to change the tab indent size and a toggle button to swap between indenting using tabs or spaces. Your configuration for your editor will be saved every time you make a change to it.

### 2.1.3.1 Uploading an Image

![Uploading an Image](https://i.postimg.cc/SsYqvRnT/image.png)

You can upload an image to your note by clicking on the "Upload Image" button in the toolbar. You will then be prompted to select an image to upload. Once you have selected an image, it will then be inserted into where your cursor is in the editor.

### 2.1.4 Managing Notes

### 2.1.4.1 Editing and Deleting Notes

If you need to edit the title, tags or delete a note, you will be able to do so by going back to the home page.

![Managing Notes](https://i.postimg.cc/mrwFgdVf/image.png)

Each note has an edit and delete button at the top right corner. By clicking on the edit button you will be able to edit the title and tags, if any. By clicking on the delete button, you will be able to delete the note.

### 2.1.4.2 Searching and Filtering Notes

You can search for a note by typing in the title or tag in the search bar at the top of the home page. This will then filter the notes displayed based on your search query. You can also sort the notes by updated date or by title and furthermore you can sort resulting notes in ascending or descending order. By default the notes are sorted by updated date. 


### 2.1.5 Managing Versions

There are three ways in which a new version of your note is created. The first is when you create a new note. The second is when you change the title or tags of the note. And the third is when you edit teh contents of the note in the editor. While editing, a new version is created every 10 minutes. In order to view the history of the note, simply click on the "History" button in the top right corner of the note. This "History" button will only be visible if you are on the editor page. After clicking on the button, a modal will appear showing the history of the note.

![History](https://i.postimg.cc/ZqVFMYGd/image.png)

Here you will be to select different versions of your note. It will also display the Markdown content of the note in a read only display.

At the bottom of the modal, you will have the option to compare the selected version with the version before it.

![Compare Versions](https://i.postimg.cc/W4HS4b5P/image.png)

This will show you the changes that were made to the note between the two versions. Any new changes would be highlighted in green and any removed changes would be highlighted in red. Any content note changes would be highlighted in gray. To go back to the original display of the selected version, click the same button, now called "Show Content" again.

In order to restore your note to a selected version, click on the "Restore" button at the bottom right of the modal. This will restore your note to the selected version.

### 2.1.5 Changing the Theme

In order to change switch the theme between light and dark mode, you can click the sun or moon icon in the top right corner of the navigation bar.

### 2.1.6 Logging out/Forgetting your password

To logout of Noted, click on the "Logout" button in the top right corner of the navigation bar. This will be on the right side of the theme toggle button. After clicking on the button, you will be logged out and redirected to the login page.

If you forgot your password, you can click on the "Reset it here" link in the login page.

![Forgot Password](https://i.postimg.cc/vTBVxWTq/image.png)

This will redirect you to the forgot password page, where you will be asked to enter your email address. Once you have entered your email address, a notification will appear saying that a password reset email has been sent to your email address.

After opening your email inbox, you will see an email with a link to reset your password. You may need to check your spam folder. After clicking on the link, you will be redirected to the reset password page.

![Reset Password](https://i.postimg.cc/ryQb6MkM/image.png)

This will redirect you to the reset password page, where you will be asked to enter your new password. Once you have entered and confirmed your new password, you will be redirected to the login page.


## 2.2 CLI (For more advanced users)

### 2.2.1 Login/Signup

In order to login or signup using the CLI, you can use the command `noted auth login`.
This will redirect you to the login page of the web application. From here you can login to an existing account or create a new account.