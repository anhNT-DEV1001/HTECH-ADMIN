"use client";

import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QACategoryModal, QAModal } from "@/features/qa/components";
import { useQA } from "@/features/qa/hooks";
import type { ICreateQA, ICreateQACategory, IQA, IQACategory } from "@/features/qa/interfaces";
import { useWeb } from "@/features/web/hooks";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Loader2,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const normalizeText = (value?: string | null) => value?.toLowerCase().trim() || "";

export default function QAPage() {
  const { confirm } = useConfirm();
  const { webData } = useWeb();
  const {
    categoryData,
    qaData,
    isLoadingCategories,
    isLoadingQA,
    isFetchingCategories,
    isFetchingQA,
    createCategory,
    updateCategory,
    deleteCategory,
    createQA,
    updateQA,
    deleteQA,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    isCreatingQA,
    isUpdatingQA,
    isDeletingQA,
  } = useQA();

  const [webFilter, setWebFilter] = useState("all");
  const [categorySearch, setCategorySearch] = useState("");
  const [qaSearch, setQASearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IQACategory | undefined>();
  const [selectedQA, setSelectedQA] = useState<IQA | undefined>();

  const websites = webData?.data || [];
  const categories = categoryData?.data || [];
  const qas = qaData?.data || [];

  const debouncedCategorySearch = useDebouncedValue(categorySearch, 300);
  const debouncedQASearch = useDebouncedValue(qaSearch, 300);

  const filteredCategories = useMemo(() => {
    const query = normalizeText(debouncedCategorySearch);

    return categories.filter((category) => {
      const matchesWeb = webFilter === "all" || category.web_id === Number(webFilter);
      const matchesSearch =
        !query ||
        normalizeText(category.name_vn).includes(query) ||
        normalizeText(category.name_en).includes(query) ||
        normalizeText(category.web?.name).includes(query);

      return matchesWeb && matchesSearch;
    });
  }, [categories, debouncedCategorySearch, webFilter]);

  const activeCategory = useMemo(
    () => filteredCategories.find((category) => category.id === selectedCategoryId) || null,
    [filteredCategories, selectedCategoryId],
  );

  const filteredQAs = useMemo(() => {
    if (!activeCategory) return [];

    const categoryQAs =
      activeCategory.qas?.length
        ? activeCategory.qas
        : qas.filter((qa) => qa.category_id === activeCategory.id);

    const query = normalizeText(debouncedQASearch);

    return categoryQAs.filter((qa) => {
      if (!query) return true;

      return (
        normalizeText(qa.question_vn).includes(query) ||
        normalizeText(qa.question_en).includes(query) ||
        normalizeText(qa.ans_vn).includes(query) ||
        normalizeText(qa.ans_en).includes(query)
      );
    });
  }, [activeCategory, debouncedQASearch, qas]);

  useEffect(() => {
    if (filteredCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    if (!filteredCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, selectedCategoryId]);

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: IQACategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setSelectedCategory(undefined);
    setIsCategoryModalOpen(false);
  };

  const handleSaveCategory = async (formData: ICreateQACategory) => {
    const accepted = await confirm({
      title: selectedCategory ? "Cập nhật QA category" : "Tạo QA category",
      message: selectedCategory
        ? `Bạn có muốn cập nhật "${selectedCategory.name_vn}"?`
        : `Bạn có muốn tạo category "${formData.name_vn}"?`,
    });

    if (!accepted) return;

    const onSuccess = () => {
      handleCloseCategoryModal();
    };

    if (selectedCategory) {
      updateCategory({ id: selectedCategory.id, ...formData }, { onSuccess });
      return;
    }

    createCategory(formData, {
      onSuccess: (response) => {
        onSuccess();
        if (response.data?.id) {
          setSelectedCategoryId(response.data.id);
        }
      },
    });
  };

  const handleDeleteCategory = async (category: IQACategory) => {
    const accepted = await confirm({
      title: "Xóa QA category",
      message: `Bạn có chắc chắn muốn xóa "${category.name_vn}"?`,
      variant: "danger",
    });

    if (accepted) deleteCategory(category.id);
  };

  const handleAddQA = () => {
    setSelectedQA(undefined);
    setIsQAModalOpen(true);
  };

  const handleEditQA = (qa: IQA) => {
    setSelectedQA(qa);
    setIsQAModalOpen(true);
  };

  const handleCloseQAModal = () => {
    setSelectedQA(undefined);
    setIsQAModalOpen(false);
  };

  const handleSaveQA = async (formData: ICreateQA) => {
    const accepted = await confirm({
      title: selectedQA ? "Cập nhật QA" : "Tạo QA",
      message: selectedQA
        ? "Bạn có muốn cập nhật câu hỏi này?"
        : "Bạn có muốn tạo câu hỏi mới cho category đang chọn?",
    });

    if (!accepted) return;

    if (selectedQA) {
      updateQA({ id: selectedQA.id, ...formData }, { onSuccess: handleCloseQAModal });
      return;
    }

    createQA(formData, { onSuccess: handleCloseQAModal });
  };

  const handleDeleteQA = async (qa: IQA) => {
    const accepted = await confirm({
      title: "Xóa QA",
      message: `Bạn có chắc chắn muốn xóa câu hỏi "${qa.question_vn}"?`,
      variant: "danger",
    });

    if (accepted) deleteQA(qa.id);
  };

  const isSavingCategory = isCreatingCategory || isUpdatingCategory;
  const isSavingQA = isCreatingQA || isUpdatingQA;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Q&A VNSEC</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý category theo website và bộ câu hỏi trả lời cho từng category.
          </p>
        </div>

        {(isFetchingCategories || isFetchingQA) && (
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Loader2 size={16} className="animate-spin" />
            Đang đồng bộ dữ liệu...
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <Card className="gap-0 overflow-hidden border-slate-200">
          <CardHeader className="border-b bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={18} className="text-emerald-600" />
                  QA Category
                </CardTitle>
                <CardDescription>Chọn website, sau đó quản lý nhóm câu hỏi.</CardDescription>
              </div>
              <Button size="sm" onClick={handleAddCategory}>
                <Plus size={15} />
                Thêm
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-5 py-5">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Website</label>
                <Select value={webFilter} onValueChange={setWebFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc theo website" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả website</SelectItem>
                    {websites.map((web) => (
                      <SelectItem key={web.id} value={String(web.id)}>
                        {web.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm category"
                />
              </div>
            </div>

            <div className="space-y-3">
              {isLoadingCategories ? (
                <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                  <Loader2 size={22} className="mx-auto mb-2 animate-spin opacity-40" />
                  Đang tải category...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                  Chưa có category phù hợp
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const qaCount = category.qas?.length ?? qas.filter((qa) => qa.category_id === category.id).length;
                  const isActive = activeCategory?.id === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition",
                        isActive
                          ? "border-emerald-300 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">{category.name_vn}</div>
                          {category.name_en && (
                            <div className="truncate text-xs text-muted-foreground">{category.name_en}</div>
                          )}
                          <div className="mt-2 text-xs text-slate-500">{category.web?.name || "Chưa có website"}</div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {qaCount}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-blue-600 hover:bg-blue-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditCategory(category);
                            }}
                            title="Cập nhật category"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-red-600 hover:bg-red-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteCategory(category);
                            }}
                            disabled={isDeletingCategory}
                            title="Xóa category"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <ChevronRight size={14} />
                        {qaCount > 0 ? `${qaCount} câu hỏi trong category này` : "Chưa có câu hỏi"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden border-slate-200">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText size={18} className="text-sky-600" />
                  Bộ câu hỏi & trả lời
                </CardTitle>
                <CardDescription>
                  {activeCategory
                    ? `Đang quản lý QA cho category "${activeCategory.name_vn}"`
                    : "Chọn một category để bắt đầu quản lý câu hỏi"}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[260px]">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <Input
                    value={qaSearch}
                    onChange={(event) => setQASearch(event.target.value)}
                    className="pl-9"
                    placeholder="Tìm theo câu hỏi hoặc câu trả lời"
                    disabled={!activeCategory}
                  />
                </div>

                <Button onClick={handleAddQA} disabled={!activeCategory}>
                  <Plus size={15} />
                  Thêm QA
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 py-5">
            {!activeCategory ? (
              <div className="rounded-2xl border border-dashed bg-slate-50/70 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <MessageSquareText size={24} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Chưa chọn category</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hãy chọn một QA category ở panel bên trái, hoặc tạo category mới để thêm câu hỏi.
                </p>
              </div>
            ) : isLoadingQA ? (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                <Loader2 size={22} className="mx-auto mb-2 animate-spin opacity-40" />
                Đang tải danh sách QA...
              </div>
            ) : filteredQAs.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-slate-50/70 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <Plus size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Chưa có câu hỏi nào</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tạo QA đầu tiên cho category <span className="font-medium">{activeCategory.name_vn}</span>.
                </p>
                <Button className="mt-5" onClick={handleAddQA}>
                  <Plus size={15} />
                  Thêm QA mới
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQAs.map((qa, index) => (
                  <div key={qa.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                            QA {index + 1}
                          </Badge>
                          <Badge variant="outline">{activeCategory.web?.name || "Website"}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900">{qa.question_vn}</h3>
                        {qa.question_en && <p className="mt-1 text-sm text-slate-500">{qa.question_en}</p>}
                      </div>

                      <div className="flex shrink-0 justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEditQA(qa)}
                          className="text-blue-600 hover:bg-blue-100"
                          title="Cập nhật QA"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteQA(qa)}
                          disabled={isDeletingQA}
                          className="text-red-600 hover:bg-red-100"
                          title="Xóa QA"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Trả lời VN
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {qa.ans_vn || "Chưa có nội dung"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Trả lời EN
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {qa.ans_en || "Chưa có nội dung"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QACategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
        data={selectedCategory}
        websites={websites}
        loading={isSavingCategory}
        defaultWebId={webFilter !== "all" ? Number(webFilter) : websites[0]?.id}
      />

      <QAModal
        isOpen={isQAModalOpen}
        onClose={handleCloseQAModal}
        onSave={handleSaveQA}
        data={selectedQA}
        category={activeCategory || undefined}
        loading={isSavingQA}
      />
    </section>
  );
}
