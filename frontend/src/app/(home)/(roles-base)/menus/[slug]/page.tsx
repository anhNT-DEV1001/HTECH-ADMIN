"use client";

import { useAction } from "@/features/action/hooks";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import ActionDetailModal from "@/features/action/components/ActionDetailModal";
import { IActionDetailForm, Action } from "@/features/action/interfaces/action.interface";
import { IResourceDetail } from "@/features/resource/interfaces";

export default function MenuDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const { 
    actionData, 
    isLoading, 
    isFetching, 
    deleteActionMutation,
    createActionMutation,
    isCreating
  } = useAction(Number(slug));
  
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const actions = actionData?.data?.actions || [];
  const resourceDetail = actionData?.data as IResourceDetail;

  const handleDelete = async (id: number, actionName: string) => {
    const isConfirm = await confirm({
      title: "Bạn có chắc chắn muốn xóa thao tác này?",
      message: `Thao tác: ${actionName}`,
      variant: "danger",
    });

    if (isConfirm) {
      deleteActionMutation.mutate(id);
    }
  };

  const handleCreateAction = (data: { action: string }) => {
    if (!resourceDetail) return;

    const newAction: Action = {
      action: data.action,
      resource_detail_alias: resourceDetail.alias,
    };

    const cleanResourceDetail: IResourceDetail = {
      id: resourceDetail.id,
      alias: resourceDetail.alias,
      is_active: resourceDetail.is_active,
      icon: resourceDetail.icon,
      href: resourceDetail.href,
    };

    const payload: IActionDetailForm = {
      resourceDetail: cleanResourceDetail,
      actions: [newAction],
    };

    createActionMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  return (
    <article>
      <header
        className="flex justify-between items-end"
        style={{ marginBottom: "5px" }}
      >
        <button
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          onClick={() => router.back()}
        >
          <div className="p-1.5 rounded-md ">
            <ArrowLeft size={18} />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-bold text-gray-800">
              Thao tác {resourceDetail?.alias || "..."}
            </h1>
          </div>
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-white bg-blue-600   transition-all duration-200 ease-in-out shadow-sm active:scale-95 hover:bg-blend-hue"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          <span className="font-medium">Thêm thao tác</span>
        </button>
      </header>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 table-fixed">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 font-semibold w-[5%] text-gray-700 text-center border border-gray-200">
                  STT
                </th>

                <th className="px-4 py-3 font-semibold w-[50%] text-center text-gray-700 border border-gray-200">
                  Tên thao tác
                </th>

                <th className="px-4 py-3 font-semibold w-[20%] text-center text-gray-700 border border-gray-200">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 font-semibold w-[20%] text-center text-gray-700 border border-gray-200">
                  Ngày cập nhật
                </th>

                <th className="px-4 py-3 font-semibold w-[5%] text-gray-700 text-center border border-gray-200">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-400 border border-gray-200"
                  >
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto mb-2 opacity-50 text-blue-600"
                    />
                    <span className="text-sm">Đang tải dữ liệu...</span>
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-400 font-light italic border border-gray-200"
                  >
                    Chưa có thao tác nào được tạo
                  </td>
                </tr>
              ) : (
                actions.map((action, index) => (
                  <tr
                    key={action.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 text-gray-500 font-mono text-sm text-center border border-gray-200 group-last:border-0">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800 border border-gray-200 group-last:border-0">
                      {action.action}
                    </td>
                    <td className="px-4 py-3  text-center border border-gray-200 group-last:border-0">
                      <span className="text-sm text-gray-600 block">
                        {dayjs(action.created_at).format("DD/MM/YYYY")}
                      </span>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {dayjs(action.created_at).format("HH:mm:ss")}
                      </span>
                    </td>
                    <td className="px-4 py-3  text-center border border-gray-200 group-last:border-0">
                      <span className="text-sm text-gray-600 block">
                        {dayjs(action.updated_at).format("DD/MM/YYYY")}
                      </span>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {dayjs(action.updated_at).format("HH:mm:ss")}
                      </span>
                    </td>
                    <td className="px-4 py-3 border  border-gray-200 group-last:border-0 text-center">
                      <button
                        onClick={() =>
                          action.id && handleDelete(action.id, action.action)
                        }
                        className="p-2 hover:bg-red-50 text-gray-400  rounded-md transition-all duration-200"
                        title="Xóa thao tác"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ActionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateAction}
        loading={isCreating}
      />
    </article>
  );
}
