const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "casbin.proto");

// Load the Casbin gRPC proto definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const casbinService = protoDescriptor.proto.Casbin;

// CasbinClient class to encapsulate the gRPC client and methods
class CasbinClient {
  constructor({ grpcHost = "localhost", grpcPort = "50051" } = {}) {
    this.grpcClient = new casbinService(
      `${grpcHost}:${grpcPort}`,
      grpc.credentials.createInsecure()
    );
    this.enforcerHandler = null;
    this.adapterHandler = null;
  }

  // Initialize adapter and enforcer with provided connection string and model text
  async initializeAdapterAndEnforcer(connectString, modelText) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if adapterHandler is already set
        if (!this.adapterHandler) {
          // Create adapter
          const adapterResponse = await new Promise((resolve, reject) => {
            this.grpcClient.NewAdapter(
              {
                adapterName: "postgres",
                driverName: "postgres",
                connectString: connectString,
                dbSpecified: true,
              },
              (error, response) => {
                if (error) {
                  console.error("Adapter creation error:", error);
                  reject(error);
                } else {
                  resolve(response);
                }
              }
            );
          });

          this.adapterHandler = adapterResponse.handler;
          console.log("Adapter initialized with handler:", this.adapterHandler);
        } else {
          console.log("Using existing adapter handler:", this.adapterHandler);
        }

        // Check if enforcerHandler is already set
        if (!this.enforcerHandler) {
          // Create enforcer with the provided modelText
          const enforcerResponse = await new Promise((resolve, reject) => {
            this.grpcClient.NewEnforcer(
              {
                modelText: modelText,
                adapterHandle: this.adapterHandler,
                enableAcceptJsonRequest: true,
              },
              (error, response) => {
                if (error) {
                  console.error("Enforcer creation error:", error);
                  reject(error);
                } else {
                  resolve(response);
                }
              }
            );
          });

          this.enforcerHandler = enforcerResponse.handler;
          console.log(
            "Enforcer initialized with handler:",
            this.enforcerHandler
          );
        } else {
          console.log("Using existing enforcer handler:", this.enforcerHandler);
        }

        // Load policy
        await new Promise((resolve, reject) => {
          this.grpcClient.LoadPolicy(
            { handler: this.enforcerHandler },
            (error, response) => {
              if (error) {
                console.error("Policy loading error:", error);
                reject(error);
              } else {
                resolve(response);
              }
            }
          );
        });

        console.log("Policy loaded successfully");
        resolve();
      } catch (error) {
        console.error("Initialization error:", error);
        reject(error);
      }
    });
  }

  // Add Policy
  addPolicy(sub, obj, act) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "p",
        params: [sub, obj, act],
      };

      this.grpcClient.AddPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Get Policies
  getPolicies() {
    return new Promise((resolve, reject) => {
      const request = {
        handler: this.enforcerHandler,
      };

      this.grpcClient.GetPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          const policies = response.d2.map((policy) => ({
            sub: policy.d1[0],
            obj: policy.d1[1],
            act: policy.d1[2],
          }));
          resolve(policies);
        }
      });
    });
  }

  // Enforce
  enforce(sub, obj, act) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        params: [sub, obj, act],
      };

      this.grpcClient.Enforce(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Remove Policy
  removePolicy(sub, obj, act) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "p",
        params: [sub, obj, act],
      };

      this.grpcClient.RemovePolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Add Grouping Policy
  addGroupingPolicy(user, role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "g",
        params: [user, role],
      };

      this.grpcClient.AddGroupingPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Remove Grouping Policy
  removeGroupingPolicy(user, role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "g",
        params: [user, role],
      };

      this.grpcClient.RemoveGroupingPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Get Roles for User
  getRolesForUser(user) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
      };

      this.grpcClient.GetRolesForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.array);
        }
      });
    });
  }

  // Get Users for Role
  getUsersForRole(role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        role: role,
      };

      this.grpcClient.GetUsersForRole(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.array);
        }
      });
    });
  }

  // Get Permissions for User
  getPermissionsForUser(user) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
      };

      this.grpcClient.GetPermissionsForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          const permissions = response.d2.map((policy) => policy.d1);
          resolve(permissions);
        }
      });
    });
  }

  // Add Permission
  addPermission(user, obj, act) {
    return this.addPolicy(user, obj, act);
  }

  // Remove Permission
  removePermission(user, obj, act) {
    return this.removePolicy(user, obj, act);
  }

  // Check Has Permission
  hasPermission(user, obj, act) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "p",
        params: [user, obj, act],
      };

      this.grpcClient.HasPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Get All Subjects
  getAllSubjects() {
    return new Promise((resolve, reject) => {
      this.grpcClient.GetAllSubjects(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.array);
          }
        }
      );
    });
  }

  // Get All Objects
  getAllObjects() {
    return new Promise((resolve, reject) => {
      this.grpcClient.GetAllObjects(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.array);
          }
        }
      );
    });
  }

  // Get All Actions
  getAllActions() {
    return new Promise((resolve, reject) => {
      this.grpcClient.GetAllActions(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.array);
          }
        }
      );
    });
  }

  // Get All Roles
  getAllRoles() {
    return new Promise((resolve, reject) => {
      this.grpcClient.GetAllRoles(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.array);
          }
        }
      );
    });
  }

  // Save Policy
  savePolicy() {
    return new Promise((resolve, reject) => {
      this.grpcClient.SavePolicy(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Load Policy
  loadPolicy() {
    return new Promise((resolve, reject) => {
      this.grpcClient.LoadPolicy(
        { handler: this.enforcerHandler },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Has Policy
  hasPolicy(sub, obj, act) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        pType: "p",
        params: [sub, obj, act],
      };

      this.grpcClient.HasPolicy(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Has Role for User
  hasRoleForUser(user, role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        role: role,
      };

      this.grpcClient.HasRoleForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Add Role for User
  addRoleForUser(user, role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        role: role,
      };

      this.grpcClient.AddRoleForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete Role for User
  deleteRoleForUser(user, role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        role: role,
      };

      this.grpcClient.DeleteRoleForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete Roles for User
  deleteRolesForUser(user) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
      };

      this.grpcClient.DeleteRolesForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete User
  deleteUser(user) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
      };

      this.grpcClient.DeleteUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete Role
  deleteRole(role) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        role: role,
      };

      this.grpcClient.DeleteRole(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // Delete Permission
  deletePermission(...permissions) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        permissions: permissions,
      };

      this.grpcClient.DeletePermission(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Add Permission for User
  addPermissionForUser(user, ...permissions) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        permissions: permissions,
      };

      this.grpcClient.AddPermissionForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete Permission for User
  deletePermissionForUser(user, ...permissions) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        permissions: permissions,
      };

      this.grpcClient.DeletePermissionForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Delete Permissions for User
  deletePermissionsForUser(user) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
      };

      this.grpcClient.DeletePermissionsForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }

  // Has Permission for User
  hasPermissionForUser(user, ...permissions) {
    return new Promise((resolve, reject) => {
      const request = {
        enforcerHandler: this.enforcerHandler,
        user: user,
        permissions: permissions,
      };

      this.grpcClient.HasPermissionForUser(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.res);
        }
      });
    });
  }
}

// Export the CasbinClient class
module.exports = CasbinClient;
