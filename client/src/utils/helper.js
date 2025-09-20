const flattenCategories = (tree, level = 0) => {
    let result = [];
  
    tree.forEach((cat) => {
      const flatCat = { ...cat, level };
      delete flatCat.children; // Clean up children to avoid nesting in final result
      result.push(flatCat);
  
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
  
    return result;
}

const buildCategoryTree = (list, parentId = null) => {
    return list
      .filter(cat => {
        if (parentId === null) {
          return !cat.parentCategory || !cat.parentCategory._id;
        }
        return cat.parentCategory?._id === parentId;
      })
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(list, cat?._id),
      }));
  }

  const getLeafCategories = (list) => {
    const tree = buildCategoryTree(list);
    const flattened = flattenCategories(tree);

    // console.log(tree, flattened);
    
    // Remove duplicates by _id
    // const seen = new Set();
    // const uniqueLeafs = [];
  
    // flattened.forEach((cat) => {
    //   const isLeaf = !list.some(item => item.parentCategory?._id === cat._id);
    //   if (isLeaf && !seen.has(cat._id)) {
    //     seen.add(cat._id);
    //     uniqueLeafs.push(cat);
    //   }
    // });
  
    return flattened;
  };

  const LogViewer = (data) => {
    console.log(data);
  };

export { getLeafCategories, LogViewer };