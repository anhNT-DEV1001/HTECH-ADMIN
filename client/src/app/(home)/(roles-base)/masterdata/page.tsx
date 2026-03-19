import { Input } from "@base-ui/react";

export default function MasterDataPage() {
  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <h1 className="text-xl font-bold text-gray-800">Cấu hình chung</h1>
      </div>

      <section>
          <Input/>
      </section>
    </section>
  );
}