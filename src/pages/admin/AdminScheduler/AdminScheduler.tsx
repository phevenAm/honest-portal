// user should be emailed 4 days in advance - reminding them to pay if they hanvet or cancell if they cannot attend. failure todo so 2 days before the session automatically cancels the session and client will have to speak to the admin to schedule a new date. if admin marks the session as paid for then the email should just be reminding them of the session and that they can cancel before 48hrs to keep money or reschedule.
//TODO: should show a calender where admin can allocate date and time to a client. admin should be able to click on a user and view a list of their future sessions. there should be action byttions next to each session and checkbox to bulk edit. actions include canceling and moving dates altogther. cancellination and date change should always fire an email over to the client
// maybe here or in cleints page, admin should be able to get how often client has attended, paid late, cancelled and what dates these occoured.

const AdminScheduler = () => {
  return (
    <div>
      <h1>AdminScheduler</h1>
    </div>
  );
};

export default AdminScheduler;
