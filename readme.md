# Casbin gRPC Client for Node.js

[![npm version](https://img.shields.io/npm/v/casbin-grpc-client.svg)](https://www.npmjs.com/package/casbin-grpc-client)
[![License](https://img.shields.io/npm/l/casbin-grpc-client.svg)](https://github.com/yourusername/casbin-grpc-client/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/casbin-grpc-client/ci.yml?branch=main)](https://github.com/yourusername/casbin-grpc-client/actions)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Example](#example)
- [API Reference](#api-reference)
  - [Class: CasbinClient](#class-casbinclient)
    - [constructor(options)](#constructoroptions)
    - [initializeAdapterAndEnforcer(connectString, modelText)](#initializeadapterandenforcerconnectstring-modeltext)
    - [addPolicy(sub, obj, act)](#addpolicysub-obj-act)
    - [getPolicies()](#getpolicies)
    - [enforce(sub, obj, act)](#enforcesub-obj-act)
    - [removePolicy(sub, obj, act)](#removepolicysub-obj-act)
    - [addGroupingPolicy(user, role)](#addgroupingpolicyuser-role)
    - [removeGroupingPolicy(user, role)](#removegroupingpolicyuser-role)
    - [getRolesForUser(user)](#getrolesforuseruser)
    - [getUsersForRole(role)](#getusersforrolerole)
    - [getPermissionsForUser(user)](#getpermissionsforuseruser)
    - [addPermission(user, obj, act)](#addpermissionuser-obj-act)
    - [removePermission(user, obj, act)](#removepermissionuser-obj-act)
    - [hasPermission(user, obj, act)](#haspermissionuser-obj-act)
    - [getAllSubjects()](#getallsubjects)
    - [getAllObjects()](#getallobjects)
    - [getAllActions()](#getallactions)
    - [getAllRoles()](#getallroles)
    - [savePolicy()](#savepolicy)
    - [loadPolicy()](#loadpolicy)
    - [hasPolicy(sub, obj, act)](#haspolicysub-obj-act)
    - [hasRoleForUser(user, role)](#hasroleforuseruser-role)
    - [addRoleForUser(user, role)](#addroleforuseruser-role)
    - [deleteRoleForUser(user, role)](#deleteroleforuseruser-role)
    - [deleteRolesForUser(user)](#deleterolesforuseruser)
    - [deleteUser(user)](#deleteuseruser)
    - [deleteRole(role)](#deleterolerole)
    - [deletePermission(...permissions)](#deletepermission-permissions)
    - [addPermissionForUser(user, ...permissions)](#addpermissionforuseruser-permissions)
    - [deletePermissionForUser(user, ...permissions)](#deletepermissionforuseruser-permissions)
    - [deletePermissionsForUser(user)](#deletepermissionsforuseruser)
    - [hasPermissionForUser(user, ...permissions)](#haspermissionforuseruser-permissions)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

\`casbin-grpc-client\` is a reusable Casbin client for Node.js applications that communicates with a Casbin gRPC server. It provides an easy-to-use interface to manage authorization policies, roles, and permissions within your microservices or serverless functions.

## Features

- **Easy Integration**: Seamlessly integrate Casbin authorization into your Node.js applications.
- **Comprehensive API**: Access all essential Casbin functionalities via gRPC.
- **Reusable Package**: Publish as an npm package for code reuse across multiple microservices.
- **Configurable**: Customize gRPC host, port, and Casbin models as per your requirements.

## Installation

Install the package via npm:

\`\`\`bash
npm install casbin-grpc-client
\`\`\`

Or using Yarn:

\`\`\`bash
yarn add casbin-grpc-client
\`\`\`

## Usage

### Initialization

First, import the \`CasbinClient\` class and initialize it with the appropriate gRPC server details. Then, initialize the adapter and enforcer with your database connection string and Casbin model.

### Example

\`\`\`javascript
const CasbinClient = require('casbin-grpc-client');

const casbinClient = new CasbinClient({
  grpcHost: process.env.ACCESS_CONTROL_GRPC_HOST || 'localhost',
  grpcPort: process.env.ACCESS_CONTROL_GRPC_PORT || '50051',
});

const modelText = \`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
\`;

const connectionString = 'postgres://user:password@localhost:5432/casbin';

async function main() {
  try {
    // Initialize the adapter and enforcer
    await casbinClient.initializeAdapterAndEnforcer(connectionString, modelText);
    console.log('Casbin enforcer initialized successfully.');

    // Add a policy
    await casbinClient.addPolicy('alice', 'data1', 'read');
    console.log('Policy added.');

    // Enforce a policy
    const allowed = await casbinClient.enforce('alice', 'data1', 'read');
    console.log(\`Enforce result: \${allowed}\`); // true

    // Get all policies
    const policies = await casbinClient.getPolicies();
    console.log('Current Policies:', policies);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
\`\`\`

## API Reference

### Class: \`CasbinClient\`

Encapsulates the gRPC client and provides methods to interact with the Casbin server.

#### \`constructor(options)\`

Creates an instance of \`CasbinClient\`.

- **Parameters:**
  - \`options\` (Object):
    - \`grpcHost\` (String, optional): The hostname of the gRPC server. Default is \`'localhost'\`.
    - \`grpcPort\` (String, optional): The port number of the gRPC server. Default is \`'50051'\`.

#### \`initializeAdapterAndEnforcer(connectString, modelText)\`

Initializes the PostgreSQL adapter and Casbin enforcer with the provided connection string and model.

- **Parameters:**
  - \`connectString\` (String): The database connection string.
  - \`modelText\` (String): The Casbin model configuration in text format.

- **Returns:** \`Promise<void>\`

#### \`addPolicy(sub, obj, act)\`

Adds a policy rule.

- **Parameters:**
  - \`sub\` (String): Subject (e.g., user).
  - \`obj\` (String): Object (e.g., resource).
  - \`act\` (String): Action (e.g., read, write).

- **Returns:** \`Promise<Boolean>\`: \`true\` if the policy was added successfully.

#### \`getPolicies()\`

Retrieves all policy rules.

- **Returns:** \`Promise<Array<Object>>\`: An array of policy objects with \`sub\`, \`obj\`, and \`act\` properties.

#### \`enforce(sub, obj, act)\`

Checks if a given request should be allowed based on the policies.

- **Parameters:**
  - \`sub\` (String): Subject (e.g., user).
  - \`obj\` (String): Object (e.g., resource).
  - \`act\` (String): Action (e.g., read, write).

- **Returns:** \`Promise<Boolean>\`: \`true\` if allowed, \`false\` otherwise.

#### \`removePolicy(sub, obj, act)\`

Removes a policy rule.

- **Parameters:**
  - \`sub\` (String): Subject (e.g., user).
  - \`obj\` (String): Object (e.g., resource).
  - \`act\` (String): Action (e.g., read, write).

- **Returns:** \`Promise<Boolean>\`: \`true\` if the policy was removed successfully.

#### \`addGroupingPolicy(user, role)\`

Adds a grouping policy (assigns a role to a user).

- **Parameters:**
  - \`user\` (String): The user.
  - \`role\` (String): The role to assign.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the grouping policy was added successfully.

#### \`removeGroupingPolicy(user, role)\`

Removes a grouping policy.

- **Parameters:**
  - \`user\` (String): The user.
  - \`role\` (String): The role to remove.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the grouping policy was removed successfully.

#### \`getRolesForUser(user)\`

Retrieves roles assigned to a user.

- **Parameters:**
  - \`user\` (String): The user.

- **Returns:** \`Promise<Array<String>>\`: An array of roles.

#### \`getUsersForRole(role)\`

Retrieves users assigned to a role.

- **Parameters:**
  - \`role\` (String): The role.

- **Returns:** \`Promise<Array<String>>\`: An array of users.

#### \`getPermissionsForUser(user)\`

Retrieves permissions assigned to a user.

- **Parameters:**
  - \`user\` (String): The user.

- **Returns:** \`Promise<Array<Array<String>>>\`: An array of permissions, each represented as an array \`[sub, obj, act]\`.

#### \`addPermission(user, obj, act)\`

Alias for \`addPolicy(sub, obj, act)\`.

- **Parameters:**
  - \`user\` (String): The user.
  - \`obj\` (String): The object.
  - \`act\` (String): The action.

- **Returns:** \`Promise<Boolean>\`

#### \`removePermission(user, obj, act)\`

Alias for \`removePolicy(sub, obj, act)\`.

- **Parameters:**
  - \`user\` (String): The user.
  - \`obj\` (String): The object.
  - \`act\` (String): The action.

- **Returns:** \`Promise<Boolean>\`

#### \`hasPermission(user, obj, act)\`

Checks if a specific permission exists.

- **Parameters:**
  - \`user\` (String): The user.
  - \`obj\` (String): The object.
  - \`act\` (String): The action.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the permission exists.

#### \`getAllSubjects()\`

Retrieves all subjects (users) in the policies.

- **Returns:** \`Promise<Array<String>>\`: An array of subjects.

#### \`getAllObjects()\`

Retrieves all objects in the policies.

- **Returns:** \`Promise<Array<String>>\`: An array of objects.

#### \`getAllActions()\`

Retrieves all actions in the policies.

- **Returns:** \`Promise<Array<String>>\`: An array of actions.

#### \`getAllRoles()\`

Retrieves all roles in the policies.

- **Returns:** \`Promise<Array<String>>\`: An array of roles.

#### \`savePolicy()\`

Saves the current policy to the adapter.

- **Returns:** \`Promise<void>\`

#### \`loadPolicy()\`

Loads the policy from the adapter.

- **Returns:** \`Promise<void>\`

#### \`hasPolicy(sub, obj, act)\`

Checks if a specific policy exists.

- **Parameters:**
  - \`sub\` (String): Subject.
  - \`obj\` (String): Object.
  - \`act\` (String): Action.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the policy exists.

#### \`hasRoleForUser(user, role)\`

Checks if a user has a specific role.

- **Parameters:**
  - \`user\` (String): The user.
  - \`role\` (String): The role.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the user has the role.

#### \`addRoleForUser(user, role)\`

Assigns a role to a user.

- **Parameters:**
  - \`user\` (String): The user.
  - \`role\` (String): The role to assign.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the role was assigned successfully.

#### \`deleteRoleForUser(user, role)\`

Removes a specific role from a user.

- **Parameters:**
  - \`user\` (String): The user.
  - \`role\` (String): The role to remove.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the role was removed successfully.

#### \`deleteRolesForUser(user)\`

Removes all roles from a user.

- **Parameters:**
  - \`user\` (String): The user.

- **Returns:** \`Promise<Boolean>\`: \`true\` if all roles were removed successfully.

#### \`deleteUser(user)\`

Deletes a user from the policies.

- **Parameters:**
  - \`user\` (String): The user.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the user was deleted successfully.

#### \`deleteRole(role)\`

Deletes a role from the policies.

- **Parameters:**
  - \`role\` (String): The role.

- **Returns:** \`Promise<void>\`

#### \`deletePermission(...permissions)\`

Deletes one or more permissions.

- **Parameters:**
  - \`permissions\` (String): Permissions to delete.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the permissions were deleted successfully.

#### \`addPermissionForUser(user, ...permissions)\`

Adds one or more permissions for a user.

- **Parameters:**
  - \`user\` (String): The user.
  - \`permissions\` (String): Permissions to add.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the permissions were added successfully.

#### \`deletePermissionForUser(user, ...permissions)\`

Deletes one or more permissions from a user.

- **Parameters:**
  - \`user\` (String): The user.
  - \`permissions\` (String): Permissions to delete.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the permissions were deleted successfully.

#### \`deletePermissionsForUser(user)\`

Deletes all permissions for a user.

- **Parameters:**
  - \`user\` (String): The user.

- **Returns:** \`Promise<Boolean>\`: \`true\` if all permissions were deleted successfully.

#### \`hasPermissionForUser(user, ...permissions)\`

Checks if a user has specific permissions.

- **Parameters:**
  - \`user\` (String): The user.
  - \`permissions\` (String): Permissions to check.

- **Returns:** \`Promise<Boolean>\`: \`true\` if the user has the permissions.

## Configuration

### Environment Variables

To configure the gRPC client, you can set the following environment variables:

- \`ACCESS_CONTROL_GRPC_HOST\`: The hostname of the Casbin gRPC server. Defaults to \`'localhost'\` if not set.
- \`ACCESS_CONTROL_GRPC_PORT\`: The port number of the Casbin gRPC server. Defaults to \`'50051'\` if not set.

### Casbin Model

Provide the Casbin model as a string when initializing the enforcer. This allows flexibility to define different authorization models as needed.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**

   Click the "Fork" button at the top right of the repository page to create your own fork.

2. **Clone Your Fork**

   \`\`\`bash
   git clone https://github.com/yourusername/casbin-grpc-client.git
   cd casbin-grpc-client
   \`\`\`

3. **Create a Feature Branch**

   \`\`\`bash
   git checkout -b feature/YourFeatureName
   \`\`\`

4. **Make Changes**

   Implement your feature or bug fix.

5. **Commit Your Changes**

   \`\`\`bash
   git commit -m "Add your message here"
   \`\`\`

6. **Push to Your Fork**

   \`\`\`bash
   git push origin feature/YourFeatureName
   \`\`\`

7. **Open a Pull Request**

   Navigate to the original repository and open a pull request from your feature branch.

## License

This project is licensed under the [MIT License](https://github.com/yourusername/casbin-grpc-client/blob/main/LICENSE).

---

## Additional Information

### Including \`casbin.proto\`

Ensure that the \`casbin.proto\` file is included in your npm package. This is necessary for the gRPC client to function correctly. The provided \`client.js\` expects the \`casbin.proto\` file to be in the same directory.

### Serverless Function Considerations

When using \`casbin-grpc-client\` in serverless environments (e.g., AWS Lambda, Azure Functions):

- **Cold Starts**: Initialize the \`CasbinClient\` outside the function handler to reuse connections across invocations and minimize cold start latency.

  \`\`\`javascript
  // handler.js
  const CasbinClient = require('casbin-grpc-client');

  const casbinClient = new CasbinClient({
    grpcHost: process.env.ACCESS_CONTROL_GRPC_HOST || 'localhost',
    grpcPort: process.env.ACCESS_CONTROL_GRPC_PORT || '50051',
  });

  // Initialize outside the handler for connection reuse
  casbinClient.initializeAdapterAndEnforcer('your-connection-string', modelText)
    .then(() => console.log('Casbin initialized'))
    .catch(console.error);

  exports.handler = async (event, context) => {
    // Your function logic using casbinClient
  };
  \`\`\`

- **Connection Limits**: Be mindful of the number of concurrent connections your gRPC server can handle. Serverless functions can scale rapidly, potentially leading to connection saturation.

### Error Handling

All methods return Promises and should be handled using \`async/await\` or \`.then/.catch\` to manage errors gracefully.

\`\`\`javascript
try {
  const allowed = await casbinClient.enforce('alice', 'data1', 'read');
  if (allowed) {
    // Proceed with the action
  } else {
    // Deny the action
  }
} catch (error) {
  console.error('Error enforcing policy:', error);
}
\`\`\`

### Testing

Before deploying your package, thoroughly test it in a local environment to ensure all methods function as expected.

1. **Install Locally**

   In a test project, install the package from the local path:

   \`\`\`bash
   npm install /path/to/casbin-grpc-client
   \`\`\`

2. **Use \`npm link\`**

   \`\`\`bash
   cd /path/to/casbin-grpc-client
   npm link

   cd /path/to/your/test/project
   npm link casbin-grpc-client
   \`\`\`

## Support

If you encounter any issues or have questions, feel free to open an [issue](https://github.com/yourusername/casbin-grpc-client/issues) on the repository.
