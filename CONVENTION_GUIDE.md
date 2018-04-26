##Style Guide
This document serves as the style guide that will be used for this project to achieve consistency and readability concerns.
As of 11/1/17, there are "hard" rules and "soft" rules that will be placed into according categories that define how to write code.
Hard rules should always be used for each new written component AS WELL AS changed in previous files.
Soft rules should always be used for each new written component and may not require changes to previous files, mostly aesthetic/readability concerns.


###Hard Rules
-The preferred naming convention for variables, methods, and file names is Camelcase (i.e. userPageLayer isntead of user_page_layer)
-The preferred indentation style is 1TBS (or K&R in the general sense)

Every written method should contain the following:
-The return type
-The respective parameter types

For each file, remove and do not keep unnecessary:
-Import statements
-Console statements
-Comments
-Files

-The type "any" should never be used unless the variable is polymorphic by nature, or type cannot be accurately expected

-All methods and variables should have a declared scope (private, public) that directly corresponds to desired scope (Make private unless public/protected is necessary)

-If a method's name or contents do not clearly describe its purpose, comments describing its purposes should be written ABOVE the method

-Change all references of "c-proj" to "Cube"

-When a component is created, if it is a child of another component (or lives in another components directory), it should have its OWN directory. Therefore if a new component belongs in the "User" directory, an entire new folder with the same name as the component should be placed into user: "User/newComponent". Additionally, each component directory should contain at least three files: .html, .scss, and .ts

-.html files should not use "style" unless it makes sense and saves work. ALl style should be contained in the appropriate .scss file for now (11/1/17), and in the future transcend where applicable into a centralized, project-wide .scss file


###Soft Rules
-Indent every file to 4 spaces
-Every executable statement that allows optional semicolons should have semicolons at the end of the statement
-If statement blocks should always be contained by braces, even if only one line statement follows the condition
-Order methods in each .ts file according to the callstack that trickles down from the lifecycle hook ngOnInit()
-Do not use bootstrap or w3, but only Angular Material for UI
-Try not to use exact pixel transformations, always keep screen size variance in mind when coding.