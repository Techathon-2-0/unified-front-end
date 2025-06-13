export const formatDate = (dateString?: string) => {
    if (!dateString) return "No date"

    try {
      const [datePart, timePart] = dateString.split("T")
      const [year, month, day] = datePart.split("-")
      const [hour, minute, secondPart] = timePart.split(":")
      const second = secondPart.split(".")[0]

      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
        Number.parseInt(hour),
        Number.parseInt(minute),
        Number.parseInt(second),
      )

      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return "Invalid date"
    }
  }