'use client'

import React from "react";

export default function RoleDetailPage({params} : {params : Promise<{slug : string}>}) {
  const {slug} = React.use(params);
  return (
    <div>Phân quyền vai trò {slug}</div>
  )
}