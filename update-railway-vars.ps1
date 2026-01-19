
param(
    [string]$Token
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$API_URL = "https://backboard.railway.app/graphql/v2"

function Invoke-GraphQL {
    param($Query, $Variables)
    $body = @{ query = $Query; variables = $Variables } | ConvertTo-Json -Depth 10
    try {
        $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -Body $body -ErrorAction Stop
        if ($response.errors) {
            Write-Host "GraphQL Errors: $($response.errors | Out-String)" -ForegroundColor Red
        }
        return $response
    } catch {
        Write-Host "API Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Response: $($reader.ReadToEnd())"
        }
        throw $_
    }
}

$projectId = "ab928dd9-7a6c-4b05-ae10-1bb2493af35e"
$envId = "f3268d26-815a-4321-89c0-43bda14db0a9"
$serviceId = "10295cf2-9f8f-4f58-abc0-f8d8cf200871"

# 1. Set DATABASE_URL to reference Postgres service
# Assuming the Postgres service is named "Postgres" (default)
Write-Host "Setting DATABASE_URL..."
$varsQuery = "mutation VariableCollectionUpsert(`$environmentId: String!, `$projectId: String!, `$serviceId: String!, `$variables: [VariableUpsertInput!]!) { variableCollectionUpsert(environmentId: `$environmentId, projectId: `$projectId, serviceId: `$serviceId, variables: `$variables) }"

# We use the reference syntax
$variables = @(
    @{ name = "DATABASE_URL"; value = "${{Postgres.DATABASE_URL}}" }
)

try {
    Invoke-GraphQL -Query $varsQuery -Variables @{ environmentId = $envId; projectId = $projectId; serviceId = $serviceId; variables = $variables }
    Write-Host "DATABASE_URL set successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to set DATABASE_URL." -ForegroundColor Red
}

# 2. Trigger Redeploy
Write-Host "Triggering Redeploy..."
$deployQuery = "mutation ServiceInstanceDeploy(`$environmentId: String!, `$serviceId: String!) { serviceInstanceDeploy(environmentId: `$environmentId, serviceId: `$serviceId) }"

try {
    Invoke-GraphQL -Query $deployQuery -Variables @{ environmentId = $envId; serviceId = $serviceId }
    Write-Host "Redeploy triggered successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to trigger redeploy." -ForegroundColor Red
}
