import React from "react";

const CategoryCard = ({ icon, label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center w-24 min-w-[5.5rem] p-2 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg"
    >
      <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-xl shadow-sm transition-colors duration-200 hover:bg-purple-200 hover:text-purple-800">
        {icon}
      </div>
      <div className="text-xs mt-2 font-medium text-gray-700">{label}</div>
    </div>
  );
};

export default CategoryCard;
