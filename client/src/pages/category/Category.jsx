import MainLayout from "../../components/layout/MainLayout";
import CategoryAddForm from "./CategoryAddForm";
import "../../assets/css/productCategory.css";
import { useState, useEffect } from "react";

import EditCategoryForm from "./EditCategoryForm";

import { useStore } from "../../store/store";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../../services/categoryServices";
import RenderCategoryList from "./CategoryList";

function Category() {
  const {categories, setCategories} = useStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    (async () => {
      const categories = await fetchCategories();
      setCategories(categories);
    })();
  }, [setCategories]);

  
  const onAddCategory = async (newCategory) => {
    
    const res = await createCategory(newCategory);
    if(res.data.success) {  
      const categories = await fetchCategories();
      setCategories(categories);
    }
    return res;

  };

  const onEditCategory = async (updatedCategory) => {
    const res = await updateCategory(updatedCategory);
    if(res.data.success) {  
      const categories = await fetchCategories();
      setCategories(categories);
    }
    return res;
  };

  const handleEditForm = (category) => {
    setEditCategory(category);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditCategory(null);
  };

  const handleDelete = async (categoryId) => {
    try {
      const success = await deleteCategory(categoryId);
      

      // Filter out the deleted category from the state
      if (!success) {
        console.error("Failed to delete category:", categoryId);
        return;
      }
      const categories = await fetchCategories();
      setCategories(categories);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <MainLayout>
      <div className="category-form">
        <h1>Add Category</h1>
        <CategoryAddForm
          categories={categories}
          onCategoryAdded={onAddCategory}
        />
      </div>
      <div className="category-list mt-5 ">
        <h5>Category List</h5>
        <RenderCategoryList
          categories={categories}
          onDelete={handleDelete}
          onEdit={handleEditForm}
        />
      </div>
      <EditCategoryForm
        show={showEditForm}
        onHide={handleCloseEditForm}
        categories={categories}
        editCategory={editCategory}
        onCategoryEdited={onEditCategory}
      />
    </MainLayout>
  );
}

export default Category;
