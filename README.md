## Cube Project (Server)

### Description
Cube is a web-based, open source, flexible GIS for communities and agencies to store and share information to solve problems.  The project is based completely on modern open source technologies.

User management will allow new users to be created, modified, and deleted.  Organization management is provided to facilitate permissions based on roles.

The core provides for layers to be created, imported, or referenced from other sources.  Created and imported layers can be modified and shared among users.

The system is designed to use feature modules that will provide custom functions that can be modified and shared as needed.  Potential modules are provided at the end of this document.

Notifications have system-wide availability.  All modules have access to initiate a notification, which are consolidated, prioritized, and sorted in users’ inboxes.  

### Technologies
The project uses Node, Typescript, and Angular to manage the core processing.  PostgreSQL with the PostGIS add-on is used for data storage and some geographical functions.  The server connects to PostgreSQL via the Sequelize library.  Leaflet is the mapping library.

### Backend Configuration
PostgreSQL is used to store all data (unless it’s referenced from another source).  This data includes:
Users
Organization
Permissions
Layers
Pages

This data is all stored in the “public” schema.  There is also a “layers” schema, which holds individual layer data.

### API
The core module accesses the backend via a secure API.  This allows the two systems to be on different servers if needed.  It also allows the backend to be changed to a backup quickly if needed.  Finally, it also allows other systems to use the datastore via the API if needed.

### Users
The core of the system is the user.  Every user belongs to a role, which is, basically, their job title.  Every role belongs to a group.  Every group belongs to a department.  The organizational structure is designed to ease permission maintenance.  Users can be defined as administrators, which provides them with access to setup and modify users and permissions.

### Layers
Layers are part of the core module in order to ensure tight integration with the map.  Layers can be created via any of the following sources:
WMS
WFS
PostGIS table (reference)
PostGIS table from scratch
Shapefile (upload)
Shapefile (reference)
KML (upload)
KML (reference)

Users can create layers and share them with other users, providing either view or view/edit permissions as needed.

Shapefiles and KML files uploaded are essentially converted to PostGIS tables.  Users can also edit any file that is uploaded if their permissions allow.

### Pages
A page is a logical object that categorizes a collection of layers and modules for a specific purpose.  For example, a “Sewer” page could include sewer inventory layers and maintenance modules, whereas a “Traffic” page could include a street closure module.

Pages allow users to group specific tools to perform specific tasks, removing the clutter of excessive layers and functions not needed for the task.  Pages can be created by an administrator and applied to users based on their role.  Only layers and modules that the users have permissions for will be allowed to be placed on a page.  Users can have unlimited numbers of pages.  One page is the default and specified by the user.

### The Inbox
The Inbox is a link always available to the user that displays the user’s notification on the left display panel.  Notifications are sorted by priority (Emergency, High, Medium, Low).  Notifications can be viewed or acknowledged (cleared) without leaving the map.  Depending on the notification, specific responses can be programmed by the module that sent the notification.

Notifications can also be sent to users via email.


### Geolocation
Geolocation of the user is provided in the core module.  The location of each user is then accessible by any module.  It also allows the core module to zoom to the user’s location if the user clicks on the geolocation button.

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


