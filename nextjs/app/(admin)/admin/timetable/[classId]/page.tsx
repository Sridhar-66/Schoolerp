const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const periods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"]

export default function ClassTimetablePage({ params }: { params: { classId: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Timetable — Class {params.classId}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead><tr>{days.map(d => <th key={d} className="border p-2">{d}</th>)}</tr></thead>
          <tbody>{periods.map(p => <tr key={p}>{days.map(d => <td key={d} className="border p-2 text-muted-foreground text-center">—</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
