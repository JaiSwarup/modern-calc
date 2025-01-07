# ModernCalc : Collaborative Spreadsheet Application on the Web

ModernCalc is a collaborative spreadsheet application built for the web. It allows multiple users to work on the same spreadsheet in real-time, providing a seamless and interactive experience.

## Deployment 
ModernCalc is live deployed at https://modern-calc.onrender.com/ using 
Render

[Render](render.com) is a cloud platform that makes it easy to host and scale web applications and static websites. It provides a simple and cost-effective solution for deploying web applications, with built-in support for Node.js, Next.js, and other popular frameworks.

## Features

- **Real-Time Collaboration**: Users can work on the same spreadsheet simultaneously, with changes reflected in real-time for all participants.
- **User Authentication**: Secure user authentication and authorization using Clerk, with support for email/password, social logins, and multi-factor authentication.
- **Spreadsheet Management**: Create, edit, and delete spreadsheets, with support for formulas, formatting, and cell


## Tech Stack

- **Next.js**: A React framework for server-side rendering and generating static websites.
- **Express**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **React**: A JavaScript library for building user interfaces.
- **MongoDB**: A NoSQL database for storing user data and spreadsheet information.
- **Sass**: A preprocessor scripting language that is interpreted or compiled into CSS.
- **Socket.io**: A library that enables real-time, bidirectional, and event-based communication.
- **Clerk**: A user management solution for authentication and user profiles.

## Installation Instructions

1. **Clone the repository**:
    ```sh
    git clone https://github.com/JaiSwarup/modern-calc.git
    cd moderncalc
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a  file in the root directory and add the following:
    ```env
    DATABASE_URL=your_mongodb_connection_string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    PORT=3000
    ```

4. **Run the development server**:
    ```sh
    npm run serve
    ```

5. **Build the project**:
    ```sh
    npm run build
    ```

6. **Start the production server**:
    ```sh
    npm start
    ```

## Future Scopes

- **Complete the Share Workbooks Function**: Enhance the sharing functionality to allow users to share their workbooks with specific users or groups, with customizable permissions.
- **Integrate AI**: Implement AI features to provide intelligent suggestions, data analysis, and automation within the spreadsheets, improving user productivity and decision-making.

ModernCalc aims to provide a powerful and user-friendly platform for collaborative spreadsheet management, with continuous improvements and new features on the horizon.