#!/bin/bash

dotnet restore
dotnet publish StudiousIndex.API/StudiousIndex.API.csproj -c Release -o out
dotnet out/StudiousIndex.API.dll