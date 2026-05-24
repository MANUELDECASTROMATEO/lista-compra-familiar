import { ShoppingApp } from "@/components/shopping-app";

type FamilyPageProps = {
  params: Promise<{ token: string }>;
};

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { token } = await params;
  return <ShoppingApp familyToken={token} />;
}
