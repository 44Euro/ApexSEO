const widths = ["78%", "62%", "85%", "54%", "70%", "66%"];

export default function Loading() {
  return (
    <div className="grid min-h-screen grid-cols-[216px_1fr] max-md:grid-cols-1">
      <div style={{ background: "#13151f", borderRight: "1px solid rgba(233,233,237,.1)" }} />
      <div className="flex flex-col gap-[2px]" style={{ padding: "24px 28px" }}>
        {widths.map((width, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_120px_130px_110px_90px] items-center gap-[16px]"
            style={{ padding: "14px 8px", borderBottom: "1px solid rgba(233,233,237,.06)" }}
          >
            <div style={{ height: 13, borderRadius: 4, background: "#292b31", width }} />
            <div style={{ height: 13, borderRadius: 4, background: "#292b31" }} />
            <div style={{ height: 13, borderRadius: 4, background: "#292b31" }} />
            <div style={{ height: 13, borderRadius: 4, background: "#292b31" }} />
            <div style={{ height: 13, borderRadius: 4, background: "#292b31" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
