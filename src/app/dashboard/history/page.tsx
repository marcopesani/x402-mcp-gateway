import { createClient } from "@/lib/supabase/server";
import TransactionList from "@/components/TransactionList";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string;

  return <TransactionList userId={userId} />;
}
