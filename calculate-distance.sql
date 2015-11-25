SELECT 
  (after_d_01 * 0.01) AS tax, 
  (after_d_01 - before__01) AS profit, 
  council, 
  after_doc_date as date 
FROM nyc_flips_pluto_150712 
WHERE ST_Within(
  the_geom_webmercator, 
  ST_Buffer(
    ST_Transform(ST_GeomFromText('Point(-73.9253282546997 40.6947773499836)',4326), 3857),
    ST_Distance_Sphere(
      ST_Transform(ST_GeomFromText('Point(-73.9253282546997 40.6947773499836)', 4326), 3857),
      ST_Transform(ST_GeomFromText('Point(-73.9253282546997 40.70972695077754)', 4326), 3857)
      )
  )
)