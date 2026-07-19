type Props = {
  priority?: string;
  riskScore?: number;
  confidence?: number;
  department?: string;
  doctor?: string;
  fee?: string;
  nextAction?: string;
};

export default function TriagePanel({
  priority = "Low",
  riskScore = 20,
  confidence = 90,
  department = "General Medicine",
  doctor = "General Physician",
  fee = "₹500",
  nextAction = "Book Appointment",
}: Props) {
  const color =
    priority === "Critical"
      ? "bg-red-500"
      : priority === "High"
      ? "bg-orange-500"
      : priority === "Medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="bg-slate-900 rounded-2xl border border-cyan-700 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-cyan-400 mb-5">
        🩺 AI Triage Report
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span>Priority</span>
          <span className={`${color} px-3 py-1 rounded-full`}>
            {priority}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Risk Score</span>
          <span>{riskScore}%</span>
        </div>

        <div className="flex justify-between">
          <span>AI Confidence</span>
          <span>{confidence}%</span>
        </div>

        <div className="flex justify-between">
          <span>Department</span>
          <span>{department}</span>
        </div>

        <div className="flex justify-between">
          <span>Doctor</span>
          <span>{doctor}</span>
        </div>

        <div className="flex justify-between">
          <span>Consultation Fee</span>
          <span>{fee}</span>
        </div>

        <div className="pt-4">
          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl">
            📅 {nextAction}
          </button>
        </div>

      </div>
    </div>
  );
}