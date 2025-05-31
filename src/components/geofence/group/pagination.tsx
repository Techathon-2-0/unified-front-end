import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PaginationProps } from "../../../types/geofence/ggroup"

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 0) return null

  return (
    <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3">
      <div className="text-sm text-gray-700 text-center sm:text-left">
        Showing <span className="font-medium">{currentItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{" "}
        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
        <span className="font-medium">{totalItems}</span> entries
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
            currentPage === 1
              ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="bg-black text-white px-3 py-1 rounded-md">
          {currentPage}/{totalPages || 1}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
            currentPage === totalPages || totalPages === 0
              ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
