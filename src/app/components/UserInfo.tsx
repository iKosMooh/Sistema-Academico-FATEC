interface UserProps {
  user: { id: string; tipo: string };
}

export default function UserInfo({ user }: UserProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p><strong>CPF:</strong> {user.id}</p>
      <p><strong>Tipo:</strong> {user.tipo}</p>
    </div>
  );
}
