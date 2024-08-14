# File Summarization Application

## Overview

This web application allows users to upload documents, generate summaries for the content, and manage their files. The app securely stores files in a user-specific folder within an AWS S3 bucket and saves metadata related to the files in a MongoDB database. This metadata includes the file's S3 location, size, original name, and summarized text, ensuring that users do not have to generate the same summary multiple times.

## Features

- **File Upload and Storage**: Users can upload files, which are automatically stored in an AWS S3 bucket within their specific folders.
- **File Summarization**: The application leverages a pre-trained BART model to summarize uploaded files. Summarized text is saved in the database to prevent redundant summarizations.
- **File Management**: Users can view, download, and delete their files while managing the summarized content efficiently.
- **Secure and Scalable Storage**: Files are stored in S3, ensuring scalability and security. Access to files is restricted to the user who uploaded them through the use of pre-signed URLs.
- **Metadata Storage**: Important information about each file, such as its location in S3, size, original name, and summarized content, is stored in MongoDB for easy retrieval and management.

## User Authentication

- **Unique Token-Based Authentication**: Instead of traditional methods like email/password or Google Auth, this application uses a unique token-based authentication system. When a user accesses the application, they are assigned a unique token stored in their browser cookies. This token is associated with their user ID in the MongoDB database, allowing the application to securely save user-specific information and restrict access to their files. This ensures that only the correct users can view and manage their specific files.

## Technology Stack

- **Frontend**: 
  - **Next.js**: Server-side rendered React framework for building optimized and performant web applications.
  - **React**: Handles the user interface and state management.
  - **Tailwind CSS**: Provides utility-first styling for responsive design.
  - **Axios**: Facilitates communication between the frontend and the Node.js backend.

- **Backends**:
  - **Node.js**:
    - **Express.js**: Manages API routes and handles CRUD operations.
    - **CORS**: Enables secure cross-origin requests.
    - **Integration**: Calls the Python backend to get summaries for the uploaded files.
  - **Python**:
    - **FastAPI**: Exposes an API endpoint for the pre-trained BART model from the Hugging Face Transformers library to perform text summarization.

- **Database**:
  - **MongoDB**: Stores metadata for each file, including S3 location, size, original name, summarized text, and user-specific tokens for secure access.

- **Storage**:
  - **AWS S3**: Provides secure and scalable storage for user files. Each user has a dedicated folder within the bucket.

## Why It Is Useful

This application streamlines the document summarization process, allowing users to upload and summarize their files efficiently. By saving summaries and file metadata, it avoids redundant operations, and the unique token-based authentication ensures that users can securely manage and access only their files.
