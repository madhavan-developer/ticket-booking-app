// lib/formatDate.js
export function formatDate(isoString) {
  const date = new Date(isoString);

  const formatted = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  // Convert "am"/"pm" to uppercase "AM"/"PM"
  return formatted.replace(/am|pm/g, (match) => match.toUpperCase());
}
