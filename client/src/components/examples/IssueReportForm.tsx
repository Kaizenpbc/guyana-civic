import IssueReportForm from '../IssueReportForm';

export default function IssueReportFormExample() {
  const handleSubmit = (issueData: any) => {
    console.log('Issue submitted:', issueData);
    alert('Issue report submitted successfully!');
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <div className="p-4">
      <IssueReportForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}