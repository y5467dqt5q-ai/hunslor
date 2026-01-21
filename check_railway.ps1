$headers = @{
    "Authorization" = "Bearer 54899149-946a-4baf-9131-f3f0140ff70e"
    "Content-Type" = "application/json"
}
$body = @{
    query = "query { me { projects { edges { node { id name deployments(first: 1) { edges { node { id status } } } } } } } }"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://backboard.railway.app/graphql/v2" -Method Post -Headers $headers -Body $body
Write-Output ($response | ConvertTo-Json -Depth 10)

