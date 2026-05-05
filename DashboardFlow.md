# Dashboard Flow
## Dashboard Access
1. To access the dashboard, the user will need to go to `/dashboard` or `/signin`. (If the user signs in with `/signin`, they will need to go to `/dashboard` anyways.)
2. Once signed in, the user account will have to be of type 'Admin' or else they won't see any new information.
3. If the user's type is 'Admin' then they user will be directed to `/dashboard`.

## Dashboard Layout
Side Navbar | Main Content

## Side Navbar Layout
- Overview
- New Project
---
- Projects
    - Projects List (Find a new name describing the projects list)
    - Time Tracking
- Finances
    - Invoices
    - Revenue
- Clients
    - Client List
    - Notes & Comms
- Settings

## Functionality
- Overview (/dashboard)
    - This is the main dashboard. It will show the following things:
        - Active Projects
        - YTD Revenue
        - Billable Rate
        - New Inquiries
        - Recent Inquiries
        - Recent Invoices
        - (Other additions that you'd might want to add.)
- New Project (Opens to a Modal)
    - Opens a new project form modal
- Projects
    - Projects List (/dashboard/projects)
        - Shows all the projects with filters to sort the projects (Active, In Review, Completed, and Archived)
        - Each project in the list will show the:
            - Project ID
            - Project Name
            - Client Name
            - Status
            - Priority
            - Progress
            - Contract Type
            - Contract $
            - Invoiced
            - Hours
            - Start Date
            - Deadline
            - Tags/Stack
            - Category
        - There will also be options to see the live url, github url, edit the project entry, delete the project entry, or show the full project details.
    - Time Tracking (/dashboard/time-tracking)
        - Will allow the user to create time entries that will add hours to the project.
        - This will auto update the finances for the project.
- Finances
    - Invoices (/dashboard/invoices)
        - The user will be able to create an invoice for a specific project. This will update the total amount invoiced for the project, as well as associating the invoice to the project in the project details.
        - The invoices should be displayed in a list that shows the:
            - Project ID
            - Project Name
            - Amount Invoiced
            - Invoice Status
            - Due Date
            - Client name
        - There should also be options to edit the invoice, delete the invoice, or show show the invoice details. 
        - This will auto update the finacnes for the project.
    - Revenue (/dashboard/revenue)
        - This will show analytics of the last few completed invoices for projects.
        - It should show the Total Contracted, Total Invoiced, and Total Outstanding.
        - It should also show the individual project revenue breakdown.
            - It should have a progress bar showing the percentage of the paid invoice and the total contract cost.
            - The project revenue breakdown should have filters for Project Type, Project Status, and Project Priority.
- Clients
    - Client List (/dashboard/clients)
        - This should show the clients that are associated to the projects.
        - It would show the Client Name, Client Email, Project Name, and Status.
        - This can be filtered by Project Type, Project Status, Sort by Client Name, and Sort by Client Email.
    - Notes & Comms (/dashboard/notes-comms)
        - This should auto-populate with the emails that are sent using the contact form in `/contact`.
        - It should show the Date, Sender, Trunicated Message, and Project Type.
        - There should also be more options to see the full communication details which will open in a modal. The modal will show the full details of Date, Project Type, Sender, and a Full Message. 
        - There should also be an option to delete the communication entry.
        - There should also be a sort and filter option.
- Settings (/dashboard/settings)
    - This should show the user.

## Extra Details
- All items should update the projects associated to the finances, and time tracking.
- Also make sure the schema doesn't need to be modified to remove duplicate fields.