## Cube Project (Client)

### Description
Cube is a web-based, open source, flexible GIS for communities and agencies to store and share information to solve problems. The project is based completely on modern open source technologies.

User management will allow new users to be created, modified, and deleted. Group management is provided to facilitate permissions based on group membership using Role-Based Access Control (RBAC).

The core provides for layers to be created, imported, or referenced from other sources. Created and imported layers can be modified and shared among users.

The system is designed to use feature modules that will provide custom functions that can be modified and shared as needed. Potential modules are provided at the end of this document.

Notifications have system-wide availability. All modules have access to initiate a notification, which are consolidated, prioritized, and sorted in users’ inboxes.

An important strength of this system is its ability to share almost anything seamlessly. Modules, layers, images, etc. can be shared from one user to another user or group depending on authorization, which will create a collaborative ecosystem for users to work with.

### Technologies
The front-end client application is built with Angular 5, and thus written in Typescript. The back-end API is written in Node server-side javascript, transpiled from Typescript using Gulp. PostgreSQL with the PostGIS add-on is used for data storage and some geographical functions. The client connects to the API via client HTTP requests that hit API endpoints. The API connects to PostgreSQL via the Sequelize library. Openlayers is the mapping library.

### Back-end API Configuration
Main dependencies and technologies: Nodejs, Express, Gulp, Sequelize, Typescript, and PostgreSQL

A PostgreSQL database is used to store all data (unless it’s referenced from another source). This data includes:
Users
Groups
Permissions
Layers
Pages

This data is all stored in the “public” schema. There is also a “layers” schema, which holds individual layer data.

The front-end accesses the back-end via a secure API. This allows the two systems to be on different servers if needed. It also allows the back-end to be changed to a backup quickly if needed. This also allows other systems to use the back-end datastore via the API if needed, i.e. sharing a .kml file via Google Earth, etc.

### Users
Every user belongs to one or more groups, which are represented by job titles. This is a simple RBAC setup, modeled with Unix permissions and Windows Group Policy aspects in mind. Users can additionally belong to the "Administrators" group, which provides them with full control of data via an administrator menu.

### Layers
Layers are part of the core module in order to ensure tight integration with the map. Layers can be created via any of the following sources:
WMS
WFS
PostGIS table (reference)
PostGIS table from scratch
Shapefile (upload)
Shapefile (reference)
KML (upload)
KML (reference)

Users can create layers and share them with other users, making them the new layer owner. They may then provide either view or view/edit permissions to other users/groups as needed.

Shapefiles and KML files uploaded are essentially converted to PostGIS tables. Users can also edit any file that is uploaded if their permissions allow.

### Pages
A page is a logical object that categorizes a collection of layers and modules for a specific purpose. For example, a “Sewer” page could include sewer inventory layers and maintenance modules, whereas a “Traffic” page could include a street closure module.

Pages allow users to group specific tools to perform specific tasks, removing the clutter of excessive layers and functions not needed for the task. Pages can be created by an administrator and applied to users based on their role. Only layers and modules that the users have permissions for will be allowed to be placed on a page. Users can have unlimited numbers of pages. One page is the default and specified by the user.

### The Inbox
The Inbox is a link always available to the user that displays the user’s notification on the left display panel. Notifications are sorted by priority (Emergency, High, Medium, Low). Notifications can be viewed or acknowledged (cleared) without leaving the map.  Depending on the notification, specific responses can be programmed by the module that sent the notification.

Notifications can also be sent to users via email, text, or any other useful outlet if need be.


### Geolocation
Geolocation of the user is provided in the core module. The location of each user is then accessible by any module. It also allows the core module to zoom to the user’s location if the user clicks on the geolocation button.

Geolocation requires the system uses HTTPS.

### Potential Feature Modules
Sewer Maintenance (rodding, vactoring, televising)
Work Orders (internal)
Work Orders (Asana) 
Accident Analysis
Street Closures
Utility Locates
Hydrology (flood management)
Traffic Volumes
Weather
Pavement Management (PASER)
Fleet Management (AVL, maintenance)
Stormwater Management (MS4, complaints)
Project Management (description, funding, scheduling)
Transit (AVL, dispatch)
Permitting
Mapillary
Document Management
Open 311


