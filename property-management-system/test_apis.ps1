# API 全面测试脚本
$baseUrl = "http://localhost:3001/api"

# 1. 登录获取 token
Write-Host "===== 1. 登录 =====" -ForegroundColor Cyan
$loginBody = @{phone="13800000001";password="13800000001"} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = "Bearer " + $loginRes.data.token
Write-Host "✅ 登录成功" -ForegroundColor Green

# Headers
$headers = @{Authorization=$token; "Content-Type"="application/json"}

# 2. 健康检查
Write-Host "`n===== 2. 健康检查 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get; Write-Host "✅ $($r.message)" -ForegroundColor Green }
catch { Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red }

# 3. 组织架构
Write-Host "`n===== 3. 组织架构 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Get -Headers $headers; Write-Host "✅ 组织列表: $($r.data.length) 条" -ForegroundColor Green }
catch { Write-Host "❌ 组织接口失败: $_" -ForegroundColor Red }

# 4. 角色管理
Write-Host "`n===== 4. 角色管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/roles" -Method Get -Headers $headers; Write-Host "✅ 角色列表: $($r.data.length) 条" -ForegroundColor Green }
catch { Write-Host "❌ 角色接口失败: $_" -ForegroundColor Red }

# 5. 用户管理
Write-Host "`n===== 5. 用户管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers; Write-Host "✅ 用户列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 用户接口失败: $_" -ForegroundColor Red }

# 6. 员工管理
Write-Host "`n===== 6. 员工管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/employees" -Method Get -Headers $headers; Write-Host "✅ 员工列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 员工接口失败: $_" -ForegroundColor Red }

# 7. 物业公司
Write-Host "`n===== 7. 物业公司 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/companies" -Method Get -Headers $headers; Write-Host "✅ 公司列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 公司接口失败: $_" -ForegroundColor Red }

# 8. 商户管理
Write-Host "`n===== 8. 商户管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/merchants" -Method Get -Headers $headers; Write-Host "✅ 商户列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 商户接口失败: $_" -ForegroundColor Red }

# 9. 投诉管理
Write-Host "`n===== 9. 投诉管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/complaints" -Method Get -Headers $headers; Write-Host "✅ 投诉列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 投诉接口失败: $_" -ForegroundColor Red }

# 10. 投诉统计
Write-Host "`n===== 10. 投诉统计 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/complaints/stats/summary" -Method Get -Headers $headers; Write-Host "✅ 投诉统计: 总计 $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 投诉统计接口失败: $_" -ForegroundColor Red }

# 11. 报修管理
Write-Host "`n===== 11. 报修管理 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/repairs" -Method Get -Headers $headers; Write-Host "✅ 报修列表: $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 报修接口失败: $_" -ForegroundColor Red }

# 12. 报修统计
Write-Host "`n===== 12. 报修统计 =====" -ForegroundColor Cyan
try { $r = Invoke-RestMethod -Uri "$baseUrl/repairs/stats/summary" -Method Get -Headers $headers; Write-Host "✅ 报修统计: 总计 $($r.data.total) 条" -ForegroundColor Green }
catch { Write-Host "❌ 报修统计接口失败: $_" -ForegroundColor Red }

# 13. 创建一条投诉数据做测试
Write-Host "`n===== 13. 创建测试投诉 =====" -ForegroundColor Cyan
try {
    $complaintBody = @{
        complainant="张三"; complainantPhone="13800000100";
        category="noise"; title="夜间施工噪音"; content="晚上10点还在施工，严重影响休息";
        source="owner_app"; urgency="urgent"; propertyCompanyId=10
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints" -Method Post -Body $complaintBody -Headers $headers
    $complaintId = $r.data.id
    Write-Host "✅ 创建投诉 ID=$complaintId" -ForegroundColor Green
    
    # 14. 获取单个投诉
    Write-Host "`n===== 14. 获取单个投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId" -Method Get -Headers $headers
    Write-Host "✅ 获取投诉: $($r.data.title)" -ForegroundColor Green
    
    # 15. 受理投诉
    Write-Host "`n===== 15. 受理投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId/accept" -Method Put -Body '{"acceptedBy":"系统管理员"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 16. 分派投诉
    Write-Host "`n===== 16. 分派投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId/assign" -Method Put -Body '{"assignedTo":"李四","assignedToPhone":"13800000101"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 17. 处理投诉
    Write-Host "`n===== 17. 处理投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId/process" -Method Put -Body '{"handleResult":"已要求施工单位停止夜间施工"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 18. 反馈投诉
    Write-Host "`n===== 18. 反馈投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId/feedback" -Method Put -Body '{"feedbackContent":"已整改完成，业主表示满意"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 19. 回访投诉
    Write-Host "`n===== 19. 回访投诉 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/$complaintId/revisit" -Method Put -Body '{"revisitRemark":"业主满意","satisfaction":5}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    Write-Host "`n✅ 投诉工作流全部测试通过!" -ForegroundColor Green
}
catch { Write-Host "❌ 投诉流程测试失败: $_" -ForegroundColor Red }

# 20. 创建测试报修
Write-Host "`n===== 20. 创建测试报修 =====" -ForegroundColor Cyan
try {
    $repairBody = @{
        ownerName="王五"; ownerPhone="13800000102";
        repairType="electric"; repairDesc="客厅灯不亮了";
        urgency="normal"; propertyCompanyId=10
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs" -Method Post -Body $repairBody -Headers $headers
    $repairId = $r.data.id
    Write-Host "✅ 创建报修 ID=$repairId" -ForegroundColor Green
    
    # 21. 派单
    Write-Host "`n===== 21. 派单 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/assign" -Method Put -Body '{"assignedTo":"电工赵六","assignedPhone":"13800000103"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 22. 接单
    Write-Host "`n===== 22. 接单 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/accept" -Method Put -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 23. 开始维修
    Write-Host "`n===== 23. 开始维修 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/start" -Method Put -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 24. 完成维修
    Write-Host "`n===== 24. 完成维修 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/complete" -Method Put -Body '{"repairResult":"已更换灯泡","cost":30,"chargeType":"paid"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 25. 业主确认
    Write-Host "`n===== 25. 业主确认 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/confirm" -Method Put -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    # 26. 业主评价
    Write-Host "`n===== 26. 业主评价 =====" -ForegroundColor Cyan
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/$repairId/evaluate" -Method Put -Body '{"rating":5,"evaluation":"修得很好，师傅专业"}' -Headers $headers
    Write-Host "✅ $($r.message)" -ForegroundColor Green
    
    Write-Host "`n✅ 报修工作流全部测试通过!" -ForegroundColor Green
}
catch { Write-Host "❌ 报修流程测试失败: $_" -ForegroundColor Red }

# 27. 再次验证统计接口
Write-Host "`n===== 27. 验证统计接口 =====" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/complaints/stats/summary" -Method Get -Headers $headers
    Write-Host "✅ 投诉统计: 总计 $($r.data.total) 条" -ForegroundColor Green
    
    $r = Invoke-RestMethod -Uri "$baseUrl/repairs/stats/summary" -Method Get -Headers $headers
    Write-Host "✅ 报修统计: 总计 $($r.data.total) 条" -ForegroundColor Green
}
catch { Write-Host "❌ 统计接口验证失败: $_" -ForegroundColor Red }

Write-Host "`n`n========== 全部测试完成 ==========" -ForegroundColor Yellow
