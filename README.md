# Document Summarization Application

## Project Overview

This project is a web application designed to allow users to upload documents, summarize their content with a Transformers model, and manage these files securely. The application leverages a microservices architecture with separate backends for different functionalities and employs AWS cloud storage to ensure that user data is safe and accessible.

## Features

- **File Upload & Summarization**: Users can upload documents in various formats (PDF, DOCX, TXT), and the application generates a summarized version of the content using a pre-trained BART model from the Hugging Face Transformers library.
  
- **Secure File Storage**: Uploaded files are securely stored in AWS S3, with each user having their own dedicated folder. The system ensures that only the user who uploaded the file can access it.

- **User Information Management**: User-specific information, including file metadata and summaries, is stored in MongoDB. The MongoDB database handles both user information and file metadata, ensuring seamless management and retrieval of data.

- **Unique Token-Based Authentication**: The application uses a unique token-based authentication method. When a user visits the application, they are assigned a unique token stored in their cookies. This token is linked to their user ID in MongoDB, allowing secure and personalized access to their files and information without relying on traditional authentication methods like email/password or third-party authentication services.

## Tech Stack

- **Frontend**: Built using Next.js to provide a fast, server-side rendered interface for users to interact with the application.
  
- **Backend**:
  - **Node.js** with Express and CORS: Handles CRUD operations, manages user sessions, and interacts with MongoDB for data storage.
  - **Python with FastAPI**: Exposes an API endpoint that the Node.js backend calls to summarize text using a pre-trained BART model from the Transformers library.
  
- **Database**: MongoDB is used for both user information management and file metadata storage. The users' schema stores details associated with each user, while the files' schema manages information related to uploaded documents.

- **Cloud Storage**: AWS S3 is used for storing uploaded files securely, with access restricted to the user who owns the file.

## Why It’s Useful

This application is particularly useful for users who need to manage large amounts of text content efficiently. By summarizing documents, users can quickly access the most critical information without needing to read through entire documents. The combination of cloud storage, secure user access, and advanced summarization techniques ensures that the application is both reliable and easy to use.

## Conclusion

This project integrates cutting-edge technologies to provide a seamless, secure, and efficient way for users to manage and summarize their documents. The use of token-based authentication, cloud storage, and microservices architecture ensures both security and performance.
