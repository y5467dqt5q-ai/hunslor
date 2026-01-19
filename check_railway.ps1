
$RailwayToken = "69ff8b0e-1770-429e-8b24-7093e92af764"
$headers = @{
    "Authorization" = "Bearer $RailwayToken"
    "Content-Type" = "application/json"
}

try {
    # Using GraphQL to get projects because v1 API might be limited or different
    $body = @{
        query = "query { me { projects { edges { node { id name } } } } }"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "https://backboard.railway.app/graphql/v2" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop

    $projects = $response.data.me.projects.edges.node
    if ($projects) {
        Write-Host "Projects found:"
        $projects | Format-Table
    } else {
        Write-Host "No projects found or token invalid scope."
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
         $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
         $responseBody = $reader.ReadToEnd()
         Write-Host "Response Body: $responseBody"
    }
}
