"use client";

import { useAction } from "@/features/action/hooks";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import ActionDetailModal from "@/features/action/components/ActionDetailModal";
import {
  IActionDetailForm,
  Action,
} from "@/features/action/interfaces/action.interface";
import { IResourceDetail } from "@/features/resource/interfaces";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    isCreating,
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
      herf: resourceDetail.herf,
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
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-blue-600"
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
          <h1 className="text-lg font-bold text-gray-800">
            Thao tác {resourceDetail?.alias || "..."}
          </h1>
        </Button>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Thêm thao tác
        </Button>
      </header>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="w-[5%] text-center">
                STT
              </TableHead>
              <TableHead className="w-[50%] text-center">
                Tên thao tác
              </TableHead>
              <TableHead className="w-[20%] text-center">
                Ngày tạo
              </TableHead>
              <TableHead className="w-[20%] text-center">
                Ngày cập nhật
              </TableHead>
              <TableHead className="w-[5%] text-center">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground"
                >
                  <Loader2
                    size={24}
                    className="animate-spin mx-auto mb-2 opacity-50 text-blue-600"
                  />
                  <span className="text-sm">Đang tải dữ liệu...</span>
                </TableCell>
              </TableRow>
            ) : actions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground font-light italic"
                >
                  Chưa có thao tác nào được tạo
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action, index) => (
                <TableRow
                  key={action.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <TableCell className="text-muted-foreground font-mono text-sm text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {action.action}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground block">
                      {dayjs(action.created_at).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {dayjs(action.created_at).format("HH:mm:ss")}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground block">
                      {dayjs(action.updated_at).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {dayjs(action.updated_at).format("HH:mm:ss")}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        action.id && handleDelete(action.id, action.action)
                      }
                      className="text-red-600 hover:bg-red-50"
                      title="Xóa thao tác"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
