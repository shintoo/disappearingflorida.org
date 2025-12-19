
for file in mtdora-*.{webp,png}; do
  if [[ $file =~ mtdora-([0-9]{4}-[0-9]{2}-[0-9]{2})(-.+)?\.(webp|png)$ ]]; then
    date="${BASH_REMATCH[1]}"
    suffix="${BASH_REMATCH[2]}"
    ext="${BASH_REMATCH[3]}"
    newname="${date}-mtdora${suffix}.${ext}"
    mv "$file" "$newname"
    echo "Renamed: $file -> $newname"
  fi
done
