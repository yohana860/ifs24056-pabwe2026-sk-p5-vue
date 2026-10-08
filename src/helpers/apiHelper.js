const BASE_URL = typeof DELCOM_BASEURL !== "undefined" ? DELCOM_BASEURL : (import.meta.env.VITE_DELCOM_BASEURL || "");
export const getAccessToken=()=>localStorage.getItem("access_token")||"";
export const putAccessToken=(token)=>token?localStorage.setItem("access_token",token):localStorage.removeItem("access_token");
export async function apiFetch(path,{method="GET",body,query,headers={}}={}) {
  const url=new URL(`${BASE_URL}${path}`);
  if(query) Object.entries(query).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=="")url.searchParams.set(k,v)});
  const h={Accept:"application/json",...headers}; const token=getAccessToken(); if(token)h.Authorization=`Bearer ${token}`;
  let payload=body;
  if(body && !(body instanceof FormData)){h["Content-Type"]="application/json";payload=JSON.stringify(body);}
  const res=await fetch(url,{method,headers:h,body:payload});
  const text=await res.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={message:text}};
  if(!res.ok) throw new Error(data.message||"Request gagal");
  return data;
}