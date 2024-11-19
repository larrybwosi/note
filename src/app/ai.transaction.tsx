import TransactionCard from 'src/components/finance/transaction.card';
import AICreatorTemplate from 'src/components/ui/ai.template';
import useFinancialStore from "src/store/finance/store";
import { Transaction } from "src/store/finance/types";
import { endpoint } from 'src/utils/env';

const FinanceCreator = () => {
  
const EXAMPLE_PROMPTS = [
  "Paid $49.99 for Netflix subscription, monthly payment",
  "Received salary of $5000 from Tech Corp",
  "Bought groceries at Walmart for $123.45 using credit card",
  "Monthly gym membership fee of $30 at LA Fitness",
  "Electric bill payment of $85.50, recurring monthly expense",
  "Coffee at Starbucks for $4.75",
  "Transferred $1000 to savings account"
];
  const { addTransaction } = useFinancialStore();
  const handleAccept = (transaction: Transaction) => {
    console.log(`Accepted transaction with ID: ${transaction}`);
    addTransaction(transaction)
  }

  const handleDelete = (id: string) => {
    console.log(`Deleted transaction with ID: ${id}`);
  }

  const handleReject = (id: string) => {
    console.log(`Rejected transaction with ID: ${id}`);
  }

  return (
    <AICreatorTemplate
      title="Budget & Finance"
      subtitle="AI-powered financial planning assistant"
      inputPlaceholder="Describe your financial goal or budget plan..."
      examplePrompts={EXAMPLE_PROMPTS}
      type="finance"
      endpoint={`${endpoint}/ai/finance`}
      addManualRoute="financeadd"
      addManualButtonText="Add Transaction"
      ItemComponent={TransactionCard}
      itemComponentProps={{
        onAccept: handleAccept,
        onReject: handleReject,
        onDelete: handleDelete,
        showActions: true,
      }}
      gradientColors={['#059669', '#10B981', '#34D399']}
    />
  );
};

export default FinanceCreator;
