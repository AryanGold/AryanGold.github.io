# Whencast Office add-in

Whencast Office add-in allows you to paste hubs from Whenhub.com into the MS Office applications such as: PowerPoint, Word / Excel. Add-in allows you to show Whencast in a presentation or spreadsheet. You can insert several Whencast into one document.

See a working example: https://youtu.be/iws0bAdx5YI

How to test the Whencast Office add-in without downloading in the Microsoft Store Add-ins on the local computer:

### Test in Office 365 Online
1. Download the Manifest file: https://aryangold.github.io/WhencastWeb/Whencast.xml
2. Open Office 365 Online Excel, and create a document.
3. You should upload the Manifest into a document, menu: Insert -> Office Add-ins -> Upload My Add-in, and choose the Manifest file and press “Upload”.
4. As a result, the Add-in will be inserted into a document and window of Whencast embed code will appear on the screen.

### Test in Office Desktop
1. Download the Manifest file: https://aryangold.github.io/WhencastWeb/Whencast.xml
2. You should use the Sideload mechanism to load the Manifest file into the Office Desktop. For more detailed information see: https://dev.office.com/docs/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins

