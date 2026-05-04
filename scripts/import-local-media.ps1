param(
  [string]$SourceRoot = "D:\upload image",
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [int]$MaxWidth = 2200,
  [int]$ThumbnailWidth = 900,
  [int]$JpegQuality = 90,
  [int]$ThumbnailQuality = 82,
  [string]$ManifestPath = (Join-Path $PSScriptRoot "local-media-curation.json")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$supportedImageExtensions = @(".jpg", ".jpeg", ".png")
$supportedVideoExtensions = @(".mp4", ".mov", ".m4v", ".webm")
$outputRoot = Join-Path $ProjectRoot "public\media\uploads"
$generatedFile = Join-Path $ProjectRoot "src\generated-local-media.js"

function Get-JpegCodec {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1
}

function Get-SafeSlug([string]$value) {
  return ($value.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
}

function Get-TitleFromSlug([string]$value) {
  $parts = $value -split "-" | Where-Object { $_ }
  return ($parts | ForEach-Object {
    if ($_.Length -eq 1) {
      $_.ToUpperInvariant()
    } else {
      $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1)
    }
  }) -join " "
}

function Get-CategoryTitle([string]$category) {
  switch ($category) {
    "nature" { return "Nature" }
    "portrait" { return "Portrait" }
    "street" { return "Street" }
    "random" { return "Random" }
    "night" { return "Night" }
    "others" { return "Others" }
    "animal" { return "Animal" }
    "monochrome" { return "Black & White" }
    default { return (Get-TitleFromSlug $category) }
  }
}

function Save-Jpeg([System.Drawing.Image]$image, [string]$path, [int]$quality) {
  $codec = Get-JpegCodec
  if (-not $codec) {
    throw "JPEG encoder is not available on this machine."
  }

  $qualityValue = [Math]::Max(1, [Math]::Min(100, $quality))
  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]$qualityValue)

  try {
    $image.Save($path, $codec, $encoderParameters)
  } finally {
    $encoderParameters.Dispose()
  }
}

function Copy-VideoFile([string]$sourcePath, [string]$destinationPath) {
  $directory = Split-Path -Parent $destinationPath
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
}

function New-ResizedBitmap([System.Drawing.Image]$image, [int]$targetWidth) {
  if ($image.Width -le $targetWidth) {
    return [System.Drawing.Bitmap]::new($image)
  }

  $ratio = $targetWidth / [double]$image.Width
  $targetHeight = [Math]::Max(1, [int][Math]::Round($image.Height * $ratio))
  $bitmap = [System.Drawing.Bitmap]::new($targetWidth, $targetHeight)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($image, 0, 0, $targetWidth, $targetHeight)
    return $bitmap
  } finally {
    $graphics.Dispose()
  }
}

function Convert-LocalImage([string]$sourcePath, [string]$destinationPath, [int]$targetWidth, [int]$quality) {
  $directory = Split-Path -Parent $destinationPath
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $image = [System.Drawing.Image]::FromFile($sourcePath)

  try {
    $bitmap = New-ResizedBitmap -image $image -targetWidth $targetWidth
    try {
      Save-Jpeg -image $bitmap -path $destinationPath -quality $quality
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}

$items = New-Object System.Collections.Generic.List[object]
$categoryOrder = @{}

if (Test-Path $ManifestPath) {
  $manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json

  foreach ($entry in $manifest) {
    $relativeSource = [string]$entry.source
    $category = [string]$entry.category
    $sourcePath = Join-Path $SourceRoot $relativeSource

    if (-not (Test-Path $sourcePath)) {
      Write-Warning ("Missing source file: " + $sourcePath)
      continue
    }

    $file = Get-Item -LiteralPath $sourcePath
    $extension = $file.Extension.ToLowerInvariant()
    $isVideo = ($entry.PSObject.Properties.Name -contains "type" -and [string]$entry.type -eq "video") -or ($supportedVideoExtensions -contains $extension)

    if (($supportedImageExtensions -notcontains $extension) -and ($supportedVideoExtensions -notcontains $extension)) {
      continue
    }

    if (-not $categoryOrder.ContainsKey($category)) {
      $categoryOrder[$category] = 0
    }

    $index = [int]$categoryOrder[$category]
    $slug = Get-SafeSlug $file.BaseName
    if (-not $slug) {
      continue
    }

    $destinationCategory = Join-Path $outputRoot $category
    $thumbnailCategory = Join-Path $destinationCategory "thumbs"
    $mediaType = if ($isVideo) { "video" } else { "image" }

    if ($isVideo) {
      $fileName = "$slug$extension"
      $relativeMediaPath = "media/uploads/$category/$fileName"
      Copy-VideoFile -sourcePath $file.FullName -destinationPath (Join-Path $destinationCategory $fileName)

      $items.Add([ordered]@{
        id = "generated-$category-$slug"
        title = if ($entry.PSObject.Properties.Name -contains "title" -and $entry.title) { [string]$entry.title } else { ("{0} Clip {1}" -f (Get-CategoryTitle $category), ($index + 1).ToString("00")) }
        description = if ($entry.PSObject.Properties.Name -contains "description") { [string]$entry.description } else { "" }
        media_type = $mediaType
        category_slug = $category
        media_url = $relativeMediaPath
        thumbnail_url = if ($entry.PSObject.Properties.Name -contains "thumbnail_url") { [string]$entry.thumbnail_url } else { "" }
        featured = [bool]($entry.PSObject.Properties.Name -contains "featured" -and $entry.featured)
        status = "published"
        sort_order = 100 + $index
        created_at = $file.LastWriteTimeUtc.ToString("o")
      }) | Out-Null
    } else {
      $fileName = "$slug.jpg"
      $thumbName = "$slug-thumb.jpg"
      $relativeMediaPath = "media/uploads/$category/$fileName"
      $relativeThumbPath = "media/uploads/$category/thumbs/$thumbName"

      Convert-LocalImage -sourcePath $file.FullName -destinationPath (Join-Path $destinationCategory $fileName) -targetWidth $MaxWidth -quality $JpegQuality
      Convert-LocalImage -sourcePath $file.FullName -destinationPath (Join-Path $thumbnailCategory $thumbName) -targetWidth $ThumbnailWidth -quality $ThumbnailQuality

      $items.Add([ordered]@{
        id = "generated-$category-$slug"
        title = if ($entry.PSObject.Properties.Name -contains "title" -and $entry.title) { [string]$entry.title } else { ("{0} Frame {1}" -f (Get-CategoryTitle $category), ($index + 1).ToString("00")) }
        description = if ($entry.PSObject.Properties.Name -contains "description") { [string]$entry.description } else { "" }
        media_type = $mediaType
        category_slug = $category
        media_url = $relativeMediaPath
        thumbnail_url = $relativeThumbPath
        featured = [bool]($entry.PSObject.Properties.Name -contains "featured" -and $entry.featured)
        status = "published"
        sort_order = 100 + $index
        created_at = $file.LastWriteTimeUtc.ToString("o")
      }) | Out-Null
    }

    $categoryOrder[$category] = $index + 1
  }
} else {
  $categories = @("nature", "portrait", "street", "random", "night", "others", "animal", "monochrome")

  foreach ($category in $categories) {
    $sourceCategory = Join-Path $SourceRoot $category
    if (-not (Test-Path $sourceCategory)) {
      continue
    }

    $destinationCategory = Join-Path $outputRoot $category
    $thumbnailCategory = Join-Path $destinationCategory "thumbs"
    $files = Get-ChildItem -LiteralPath $sourceCategory -File |
      Where-Object { $supportedImageExtensions -contains $_.Extension.ToLowerInvariant() } |
      Sort-Object Name

    $index = 0

    foreach ($file in $files) {
      $slug = Get-SafeSlug $file.BaseName
      if (-not $slug) {
        continue
      }

      $fileName = "$slug.jpg"
      $thumbName = "$slug-thumb.jpg"
      $relativeMediaPath = "media/uploads/$category/$fileName"
      $relativeThumbPath = "media/uploads/$category/thumbs/$thumbName"

      Convert-LocalImage -sourcePath $file.FullName -destinationPath (Join-Path $destinationCategory $fileName) -targetWidth $MaxWidth -quality $JpegQuality
      Convert-LocalImage -sourcePath $file.FullName -destinationPath (Join-Path $thumbnailCategory $thumbName) -targetWidth $ThumbnailWidth -quality $ThumbnailQuality

      $items.Add([ordered]@{
        id = "generated-$category-$slug"
        title = ("{0} Frame {1}" -f (Get-CategoryTitle $category), ($index + 1).ToString("00"))
        description = ""
        media_type = "image"
        category_slug = $category
        media_url = $relativeMediaPath
        thumbnail_url = $relativeThumbPath
        featured = ($index -eq 0)
        status = "published"
        sort_order = 100 + $index
        created_at = $file.LastWriteTimeUtc.ToString("o")
      }) | Out-Null

      $index++
    }
  }
}

$json = if ($items.Count -gt 0) {
  $items | ConvertTo-Json -Depth 5
} else {
  "[]"
}

$generatedContent = @(
  "export const generatedLocalMedia = ",
  $json,
  ";"
) -join "`n"

Set-Content -LiteralPath $generatedFile -Value $generatedContent -Encoding UTF8
Write-Output ("Imported " + $items.Count + " media item(s) from " + $SourceRoot)
