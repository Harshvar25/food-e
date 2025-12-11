export default function DashboardCard({ title, onClick }) {
    return (
        <div
            onClick={onClick}
            className="p-6 bg-white rounded-xl shadow text-center cursor-pointer hover:shadow-lg transition"
        >
            <p className="font-medium text-lg">{title}</p>
        </div>
    );
}
