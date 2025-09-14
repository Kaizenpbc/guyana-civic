import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return <LoginForm onSuccess={() => window.location.href = '/'} />;
}
