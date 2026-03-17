export default function CategoriesPage() {
  return (
    <section>
      <h1>Quản lý danh mục</h1>
      <div className="flex flex-col gap-4">
          <select name="category" id="category" className="border border-gray-300 rounded-md p-2">
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Thêm mới</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
      </table>
    </section>
  )
}